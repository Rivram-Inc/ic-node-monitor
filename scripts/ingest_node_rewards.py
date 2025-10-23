#!/usr/bin/env python3
"""
Script to ingest DRE node rewards CSV data into PostgreSQL database.

Usage:
    python ingest_node_rewards.py <path_to_dre_output_directory>

Example:
    python ingest_node_rewards.py ./dre-tool-generate-node-rewards

The script expects the directory structure:
    dre-tool-generate-node-rewards/
        <node-provider-id-1>/
            node_metrics_by_node.csv
        <node-provider-id-2>/
            ...
"""

import os
import sys
import csv
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
from typing import List, Dict, Optional
import logging
from pathlib import Path
from dotenv import load_dotenv

# Set up environment and logging
env = os.getenv("ENV", "dev")  # Default to 'dev' if not set

# Set up script directory and log file
script_dir = Path(__file__).resolve().parent
log_file = script_dir / f"{env}.node_rewards_ingester.log"
env_file = script_dir / f".env.{env}"

# Ensure log file exists
log_path = Path(log_file)
if not log_path.exists():
    log_path.touch()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),  # Logs to file
        logging.StreamHandler()         # Also log to console
    ]
)
logger = logging.getLogger(__name__)

# Load environment-specific variables
dotenv_path = Path(env_file)
if dotenv_path.exists():
    load_dotenv(dotenv_path)
    logger.info(f"Loaded environment variables from {env_file}")
else:
    logger.warning(f"Environment file {env_file} not found. Using default environment variables.")


class NodeRewardsIngester:
    def __init__(self, db_config: Dict[str, str]):
        """Initialize the ingester with database configuration."""
        self.db_config = db_config
        self.conn = None
        self.cursor = None
        
    def connect(self):
        """Connect to the PostgreSQL database."""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.cursor = self.conn.cursor()
            logger.info("Successfully connected to database")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    def close(self):
        """Close database connection."""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        logger.info("Database connection closed")
    
    def create_tables(self):
        """Create the required tables if they don't exist."""
        try:
            # Create node_reward_metrics table
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS node_reward_metrics (
                    id SERIAL PRIMARY KEY,
                    node_id TEXT NOT NULL,
                    node_provider_id TEXT NOT NULL,
                    day_utc DATE NOT NULL,
                    node_reward_type TEXT,
                    region TEXT,
                    dc_id TEXT,
                    node_status TEXT,
                    performance_multiplier DECIMAL(10, 2),
                    rewards_reduction DECIMAL(10, 2),
                    base_rewards_xdr_permyriad BIGINT,
                    adjusted_rewards_xdr_permyriad BIGINT,
                    subnet_assigned TEXT,
                    subnet_assigned_fr DECIMAL(30, 28),
                    num_blocks_proposed INTEGER,
                    num_blocks_failed INTEGER,
                    original_fr DECIMAL(30, 28),
                    relative_fr DECIMAL(30, 28),
                    extrapolated_fr DECIMAL(30, 28),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(node_id, day_utc)
                );
                
                CREATE INDEX IF NOT EXISTS idx_node_reward_metrics_node_id 
                    ON node_reward_metrics(node_id);
                CREATE INDEX IF NOT EXISTS idx_node_reward_metrics_provider_id 
                    ON node_reward_metrics(node_provider_id);
                CREATE INDEX IF NOT EXISTS idx_node_reward_metrics_day_utc 
                    ON node_reward_metrics(day_utc);
                CREATE INDEX IF NOT EXISTS idx_node_reward_metrics_node_status 
                    ON node_reward_metrics(node_status);
                CREATE INDEX IF NOT EXISTS idx_node_reward_metrics_provider_day 
                    ON node_reward_metrics(node_provider_id, day_utc);
            """)
            
            # Create node_provider_daily_summary table (for aggregated metrics)
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS node_provider_daily_summary (
                    id SERIAL PRIMARY KEY,
                    node_provider_id TEXT NOT NULL,
                    day_utc DATE NOT NULL,
                    total_nodes INTEGER,
                    assigned_nodes INTEGER,
                    unassigned_nodes INTEGER,
                    expected_rewards_xdr_permyriad BIGINT,
                    actual_rewards_xdr_permyriad BIGINT,
                    total_reduction_xdr_permyriad BIGINT,
                    total_blocks_proposed INTEGER,
                    total_blocks_failed INTEGER,
                    total_failure_rate DECIMAL(10, 8),
                    underperforming_nodes_count INTEGER,
                    underperforming_nodes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(node_provider_id, day_utc)
                );
                
                CREATE INDEX IF NOT EXISTS idx_provider_summary_provider_id 
                    ON node_provider_daily_summary(node_provider_id);
                CREATE INDEX IF NOT EXISTS idx_provider_summary_day 
                    ON node_provider_daily_summary(day_utc);
            """)
            
            # Create xdr_icp_conversion_rates table
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS xdr_icp_conversion_rates (
                    id SERIAL PRIMARY KEY,
                    day_utc DATE NOT NULL UNIQUE,
                    xdr_to_usd DECIMAL(18, 10),
                    icp_to_usd DECIMAL(18, 10),
                    xdr_to_icp DECIMAL(18, 10),
                    source TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE INDEX IF NOT EXISTS idx_conversion_day 
                    ON xdr_icp_conversion_rates(day_utc);
            """)
            
            self.conn.commit()
            logger.info("Tables created/verified successfully")
        except Exception as e:
            logger.error(f"Failed to create tables: {e}")
            self.conn.rollback()
            raise
    
    def parse_date(self, date_str: str) -> Optional[str]:
        """Parse date from DD-MM-YYYY format to YYYY-MM-DD format."""
        if not date_str or date_str.strip() == '':
            return None
        try:
            dt = datetime.strptime(date_str, "%d-%m-%Y")
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            logger.warning(f"Failed to parse date: {date_str}")
            return None
    
    def parse_decimal(self, value: str) -> Optional[float]:
        """Parse decimal value, handling empty strings."""
        if not value or value.strip() == '':
            return None
        try:
            return float(value)
        except ValueError:
            logger.warning(f"Failed to parse decimal: {value}")
            return None
    
    def parse_int(self, value: str) -> Optional[int]:
        """Parse integer value, handling empty strings."""
        if not value or value.strip() == '':
            return None
        try:
            return int(value)
        except ValueError:
            logger.warning(f"Failed to parse integer: {value}")
            return None
    
    def ingest_node_metrics(self, node_provider_id: str, csv_path: str) -> int:
        """Ingest node metrics from node_metrics_by_node.csv."""
        if not os.path.exists(csv_path):
            logger.warning(f"File not found: {csv_path}")
            return 0
        
        records_dict = {}
        total_rows = 0
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    total_rows += 1
                    # Create unique key (node_id, day_utc) to deduplicate
                    key = (row['node_id'], self.parse_date(row['day_utc']))
                    record = (
                        row['node_id'],
                        node_provider_id,
                        self.parse_date(row['day_utc']),
                        row['node_reward_type'] or None,
                        row['region'] or None,
                        row['dc_id'] or None,
                        row['node_status'] or None,
                        self.parse_decimal(row['performance_multiplier']),
                        self.parse_decimal(row['rewards_reduction']),
                        self.parse_int(row['base_rewards_xdr_permyriad']),
                        self.parse_int(row['adjusted_rewards_xdr_permyriad']),
                        row['subnet_assigned'] or None,
                        self.parse_decimal(row['subnet_assigned_fr']),
                        self.parse_int(row['num_blocks_proposed']),
                        self.parse_int(row['num_blocks_failed']),
                        self.parse_decimal(row['original_fr']),
                        self.parse_decimal(row['relative_fr']),
                        self.parse_decimal(row['extrapolated_fr']),
                    )
                    # Keep last occurrence of duplicate keys
                    records_dict[key] = record
            
            records = list(records_dict.values())
            unique_rows = len(records_dict)
            
            if total_rows > unique_rows:
                logger.warning(f"Found {total_rows - unique_rows} duplicate rows in node metrics CSV, keeping last occurrence")
            
            if records:
                execute_values(
                    self.cursor,
                    """
                    INSERT INTO node_reward_metrics (
                        node_id, node_provider_id, day_utc, node_reward_type, region, dc_id, node_status,
                        performance_multiplier, rewards_reduction, base_rewards_xdr_permyriad,
                        adjusted_rewards_xdr_permyriad, subnet_assigned, subnet_assigned_fr,
                        num_blocks_proposed, num_blocks_failed, original_fr, relative_fr, extrapolated_fr
                    ) VALUES %s
                    ON CONFLICT (node_id, day_utc) DO UPDATE SET
                        node_provider_id = EXCLUDED.node_provider_id,
                        node_reward_type = EXCLUDED.node_reward_type,
                        region = EXCLUDED.region,
                        dc_id = EXCLUDED.dc_id,
                        node_status = EXCLUDED.node_status,
                        performance_multiplier = EXCLUDED.performance_multiplier,
                        rewards_reduction = EXCLUDED.rewards_reduction,
                        base_rewards_xdr_permyriad = EXCLUDED.base_rewards_xdr_permyriad,
                        adjusted_rewards_xdr_permyriad = EXCLUDED.adjusted_rewards_xdr_permyriad,
                        subnet_assigned = EXCLUDED.subnet_assigned,
                        subnet_assigned_fr = EXCLUDED.subnet_assigned_fr,
                        num_blocks_proposed = EXCLUDED.num_blocks_proposed,
                        num_blocks_failed = EXCLUDED.num_blocks_failed,
                        original_fr = EXCLUDED.original_fr,
                        relative_fr = EXCLUDED.relative_fr,
                        extrapolated_fr = EXCLUDED.extrapolated_fr,
                        updated_at = CURRENT_TIMESTAMP
                    """,
                    records
                )
                self.conn.commit()
                logger.info(f"Inserted/Updated {len(records)} node metrics records for {node_provider_id}")
                return len(records)
        except Exception as e:
            logger.error(f"Failed to ingest node metrics for {node_provider_id}: {e}")
            self.conn.rollback()
            return 0
        
        return 0
    
    def generate_provider_daily_summary(self, node_provider_id: str, day_utc: str) -> bool:
        """Generate aggregated daily summary for a provider from node metrics."""
        try:
            # Aggregate from node_reward_metrics for this provider and day
            self.cursor.execute("""
                INSERT INTO node_provider_daily_summary (
                    node_provider_id, day_utc, total_nodes, assigned_nodes, unassigned_nodes,
                    expected_rewards_xdr_permyriad, actual_rewards_xdr_permyriad,
                    total_reduction_xdr_permyriad, total_blocks_proposed,
                    total_blocks_failed, total_failure_rate
                )
                SELECT 
                    %s as node_provider_id,
                    %s as day_utc,
                    COUNT(*) as total_nodes,
                    COUNT(CASE WHEN node_status = 'Assigned' THEN 1 END) as assigned_nodes,
                    COUNT(CASE WHEN node_status != 'Assigned' THEN 1 END) as unassigned_nodes,
                    SUM(base_rewards_xdr_permyriad) as expected_rewards_xdr_permyriad,
                    SUM(adjusted_rewards_xdr_permyriad) as actual_rewards_xdr_permyriad,
                    SUM(base_rewards_xdr_permyriad - adjusted_rewards_xdr_permyriad) as total_reduction_xdr_permyriad,
                    SUM(num_blocks_proposed) as total_blocks_proposed,
                    SUM(num_blocks_failed) as total_blocks_failed,
                    CASE 
                        WHEN SUM(num_blocks_proposed) > 0 
                        THEN CAST(SUM(num_blocks_failed) AS DECIMAL) / SUM(num_blocks_proposed)
                        ELSE 0
                    END as total_failure_rate
                FROM node_reward_metrics
                WHERE node_provider_id = %s AND day_utc = %s
                ON CONFLICT (node_provider_id, day_utc) DO UPDATE SET
                    total_nodes = EXCLUDED.total_nodes,
                    assigned_nodes = EXCLUDED.assigned_nodes,
                    unassigned_nodes = EXCLUDED.unassigned_nodes,
                    expected_rewards_xdr_permyriad = EXCLUDED.expected_rewards_xdr_permyriad,
                    actual_rewards_xdr_permyriad = EXCLUDED.actual_rewards_xdr_permyriad,
                    total_reduction_xdr_permyriad = EXCLUDED.total_reduction_xdr_permyriad,
                    total_blocks_proposed = EXCLUDED.total_blocks_proposed,
                    total_blocks_failed = EXCLUDED.total_blocks_failed,
                    total_failure_rate = EXCLUDED.total_failure_rate,
                    updated_at = CURRENT_TIMESTAMP
            """, (node_provider_id, day_utc, node_provider_id, day_utc))
            
            self.conn.commit()
            return True
        except Exception as e:
            logger.error(f"Failed to generate provider summary for {node_provider_id} on {day_utc}: {e}")
            self.conn.rollback()
            return False
    
    def ingest_directory(self, dre_output_dir: str) -> Dict[str, int]:
        """Ingest all CSV files from the DRE output directory."""
        stats = {
            'node_providers_processed': 0,
            'node_metrics_records': 0,
        }
        
        if not os.path.exists(dre_output_dir):
            logger.error(f"Directory not found: {dre_output_dir}")
            return stats
        
        # List all subdirectories (each is a node provider)
        node_provider_dirs = [
            d for d in os.listdir(dre_output_dir)
            if os.path.isdir(os.path.join(dre_output_dir, d))
        ]
        
        total_providers = len(node_provider_dirs)
        logger.info(f"Found {total_providers} node provider directories")
        logger.info("=" * 60)
        
        for idx, node_provider_id in enumerate(node_provider_dirs, 1):
            provider_dir = os.path.join(dre_output_dir, node_provider_id)
            progress_pct = (idx / total_providers) * 100
            logger.info(f"\n[{idx}/{total_providers}] ({progress_pct:.1f}%) Processing: {node_provider_id}")
            
            # Ingest node metrics
            node_metrics_path = os.path.join(provider_dir, 'node_metrics_by_node.csv')
            stats['node_metrics_records'] += self.ingest_node_metrics(
                node_provider_id, node_metrics_path
            )
            
            # Generate provider daily summaries for each unique day in node metrics
            self.cursor.execute("""
                SELECT DISTINCT day_utc 
                FROM node_reward_metrics 
                WHERE node_provider_id = %s
                ORDER BY day_utc DESC
            """, (node_provider_id,))
            
            unique_days = [row[0] for row in self.cursor.fetchall()]
            for day in unique_days:
                self.generate_provider_daily_summary(node_provider_id, str(day))
            
            logger.info(f"  ✓ Generated {len(unique_days)} provider daily summaries")
            
            stats['node_providers_processed'] += 1
            remaining = total_providers - idx
            if remaining > 0:
                logger.info(f"  → {remaining} provider{'s' if remaining != 1 else ''} remaining\n")
        
        logger.info("=" * 60)
        return stats


def main():
    """Main entry point for the script."""
    if len(sys.argv) < 2:
        print("Usage: python ingest_node_rewards.py <path_to_dre_output_directory>")
        print("Example: python ingest_node_rewards.py ./dre-tool-generate-node-rewards")
        sys.exit(1)
    
    dre_output_dir = sys.argv[1]
    
    # Database configuration (from environment variables)
    db_config = {
        'dbname': os.getenv('DATABASE_NAME'),
        'user': os.getenv('DATABASE_USER'),
        'password': os.getenv('DATABASE_PASSWORD'),
        'host': os.getenv('DATABASE_HOST'),
        'port': os.getenv('DATABASE_PORT'),
    }
    
    logger.info("Starting node rewards ingestion...")
    logger.info(f"DRE output directory: {dre_output_dir}")
    logger.info(f"Database: {db_config['user']}@{db_config['host']}:{db_config['port']}/{db_config['dbname']}")
    
    ingester = NodeRewardsIngester(db_config)
    
    try:
        ingester.connect()
        ingester.create_tables()
        stats = ingester.ingest_directory(dre_output_dir)
        
        logger.info("=" * 60)
        logger.info("INGESTION COMPLETED SUCCESSFULLY")
        logger.info("=" * 60)
        logger.info(f"Node providers processed: {stats['node_providers_processed']}")
        logger.info(f"Node metrics records: {stats['node_metrics_records']}")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"Fatal error during ingestion: {e}")
        sys.exit(1)
    finally:
        ingester.close()


if __name__ == "__main__":
    main()
