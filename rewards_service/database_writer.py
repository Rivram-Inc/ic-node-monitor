"""
Database Writer Component
Handles writing data to PostgreSQL database.
"""
import psycopg2
from psycopg2.extras import execute_values
from typing import List, Dict
from datetime import date
import logging


class DatabaseWriter:
    def __init__(self, db_config: Dict):
        """
        Initialize Database Writer.
        
        Args:
            db_config: Database configuration dictionary
        """
        self.db_config = db_config
        self.conn = None
        self.cursor = None
        self.logger = logging.getLogger(__name__)
    
    def connect(self):
        """Connect to the PostgreSQL database."""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.cursor = self.conn.cursor()
            self.logger.info(f"Connected to database: {self.db_config['dbname']}")
        except Exception as e:
            self.logger.error(f"Failed to connect to database: {e}")
            raise
    
    def close(self):
        """Close database connection."""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        self.logger.info("Database connection closed")
    
    def ensure_tables_exist(self):
        """Create tables if they don't exist."""
        try:
            # Create node_reward_metrics table
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS node_reward_metrics (
                    id SERIAL PRIMARY KEY,
                    node_id TEXT NOT NULL,
                    node_provider_id TEXT NOT NULL,
                    day_utc DATE NOT NULL,
                    node_status TEXT,
                    subnet_assigned TEXT,
                    dc_id TEXT,
                    region TEXT,
                    performance_multiplier DECIMAL(10, 2),
                    rewards_reduction DECIMAL(10, 2),
                    base_rewards_xdr_permyriad BIGINT,
                    adjusted_rewards_xdr_permyriad BIGINT,
                    num_blocks_proposed INTEGER DEFAULT 0,
                    num_blocks_failed INTEGER DEFAULT 0,
                    daily_failure_rate DECIMAL(10, 8),
                    node_reward_type TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(node_id, day_utc)
                );
                
                CREATE INDEX IF NOT EXISTS idx_node_reward_node_id 
                    ON node_reward_metrics(node_id);
                CREATE INDEX IF NOT EXISTS idx_node_reward_provider_id 
                    ON node_reward_metrics(node_provider_id);
                CREATE INDEX IF NOT EXISTS idx_node_reward_day 
                    ON node_reward_metrics(day_utc);
                CREATE INDEX IF NOT EXISTS idx_node_reward_status 
                    ON node_reward_metrics(node_status);
                CREATE INDEX IF NOT EXISTS idx_node_reward_provider_day 
                    ON node_reward_metrics(node_provider_id, day_utc);
            """)
            
            # Create node_provider_daily_summary table
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
            self.logger.info("Database tables verified/created successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to create tables: {e}")
            self.conn.rollback()
            raise
    
    def upsert_node_metrics(self, node_provider_id: str, records: List[Dict]) -> int:
        """
        Insert or update node metrics records.
        
        Args:
            node_provider_id: Node provider ID
            records: List of node metric records
            
        Returns:
            Number of records processed
        """
        if not records:
            return 0
        
        try:
            values = [
                (
                    r['node_id'],
                    node_provider_id,
                    r['day_utc'],
                    r['node_status'],
                    r['subnet_assigned'],
                    r['dc_id'],
                    r['region'],
                    r['performance_multiplier'],
                    r['rewards_reduction'],
                    r['base_rewards_xdr_permyriad'],
                    r['adjusted_rewards_xdr_permyriad'],
                    r['num_blocks_proposed'],
                    r['num_blocks_failed'],
                    r['daily_failure_rate'],
                    r['node_reward_type'],
                )
                for r in records if r['day_utc'] is not None
            ]
            
            if not values:
                self.logger.warning("No valid records to insert")
                return 0
            
            execute_values(
                self.cursor,
                """
                INSERT INTO node_reward_metrics (
                    node_id, node_provider_id, day_utc, node_status, subnet_assigned,
                    dc_id, region, performance_multiplier, rewards_reduction,
                    base_rewards_xdr_permyriad, adjusted_rewards_xdr_permyriad,
                    num_blocks_proposed, num_blocks_failed, daily_failure_rate,
                    node_reward_type
                ) VALUES %s
                ON CONFLICT (node_id, day_utc) DO UPDATE SET
                    node_provider_id = EXCLUDED.node_provider_id,
                    node_status = EXCLUDED.node_status,
                    subnet_assigned = EXCLUDED.subnet_assigned,
                    dc_id = EXCLUDED.dc_id,
                    region = EXCLUDED.region,
                    performance_multiplier = EXCLUDED.performance_multiplier,
                    rewards_reduction = EXCLUDED.rewards_reduction,
                    base_rewards_xdr_permyriad = EXCLUDED.base_rewards_xdr_permyriad,
                    adjusted_rewards_xdr_permyriad = EXCLUDED.adjusted_rewards_xdr_permyriad,
                    num_blocks_proposed = EXCLUDED.num_blocks_proposed,
                    num_blocks_failed = EXCLUDED.num_blocks_failed,
                    daily_failure_rate = EXCLUDED.daily_failure_rate,
                    node_reward_type = EXCLUDED.node_reward_type,
                    updated_at = CURRENT_TIMESTAMP
                """,
                values
            )
            
            self.conn.commit()
            self.logger.info(f"Upserted {len(values)} node metrics for provider {node_provider_id}")
            return len(values)
            
        except Exception as e:
            self.logger.error(f"Failed to upsert node metrics: {e}")
            self.conn.rollback()
            raise
    
    def generate_provider_summary(self, node_provider_id: str, day_utc: date):
        """
        Generate provider summary from node metrics for a specific day.
        
        Args:
            node_provider_id: Node provider ID
            day_utc: Date for the summary
        """
        try:
            self.cursor.execute("""
                INSERT INTO node_provider_daily_summary (
                    node_provider_id, day_utc, total_nodes, assigned_nodes, unassigned_nodes,
                    expected_rewards_xdr_permyriad, actual_rewards_xdr_permyriad,
                    total_reduction_xdr_permyriad, total_blocks_proposed, total_blocks_failed,
                    total_failure_rate
                )
                SELECT 
                    node_provider_id,
                    day_utc,
                    COUNT(*) as total_nodes,
                    COUNT(*) FILTER (WHERE node_status = 'Assigned') as assigned_nodes,
                    COUNT(*) FILTER (WHERE node_status = 'Unassigned') as unassigned_nodes,
                    SUM(base_rewards_xdr_permyriad) as expected_rewards,
                    SUM(adjusted_rewards_xdr_permyriad) as actual_rewards,
                    SUM(base_rewards_xdr_permyriad) - SUM(adjusted_rewards_xdr_permyriad) as reduction,
                    SUM(num_blocks_proposed) as total_proposed,
                    SUM(num_blocks_failed) as total_failed,
                    CASE 
                        WHEN SUM(num_blocks_proposed + num_blocks_failed) > 0 
                        THEN (SUM(num_blocks_failed)::DECIMAL / SUM(num_blocks_proposed + num_blocks_failed) * 100)
                        ELSE 0 
                    END as failure_rate
                FROM node_reward_metrics
                WHERE node_provider_id = %s AND day_utc = %s
                GROUP BY node_provider_id, day_utc
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
            """, (node_provider_id, day_utc))
            
            self.conn.commit()
            self.logger.debug(f"Generated summary for provider {node_provider_id} on {day_utc}")
            
        except Exception as e:
            self.logger.error(f"Failed to generate provider summary: {e}")
            self.conn.rollback()
            raise
    
    def upsert_conversion_rate(self, day_utc: date, rates: Dict):
        """
        Insert or update XDR to ICP conversion rate.
        
        Args:
            day_utc: Date for the rate
            rates: Dictionary containing conversion rates
        """
        try:
            self.cursor.execute("""
                INSERT INTO xdr_icp_conversion_rates (
                    day_utc, xdr_to_usd, icp_to_usd, xdr_to_icp, source
                ) VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (day_utc) DO UPDATE SET
                    xdr_to_usd = EXCLUDED.xdr_to_usd,
                    icp_to_usd = EXCLUDED.icp_to_usd,
                    xdr_to_icp = EXCLUDED.xdr_to_icp,
                    source = EXCLUDED.source,
                    updated_at = CURRENT_TIMESTAMP
            """, (
                day_utc,
                rates['xdr_to_usd'],
                rates['icp_to_usd'],
                rates['xdr_to_icp'],
                rates.get('source', 'unknown')
            ))
            
            self.conn.commit()
            self.logger.info(f"Upserted conversion rate for {day_utc}")
            
        except Exception as e:
            self.logger.error(f"Failed to upsert conversion rate: {e}")
            self.conn.rollback()
            raise
    
    def get_latest_data_date(self) -> date:
        """
        Get the latest date for which we have reward data.
        
        Returns:
            Latest date or None if no data
        """
        try:
            self.cursor.execute("""
                SELECT MAX(day_utc) FROM node_reward_metrics
            """)
            result = self.cursor.fetchone()
            return result[0] if result[0] else None
        except Exception as e:
            self.logger.error(f"Failed to get latest data date: {e}")
            return None

