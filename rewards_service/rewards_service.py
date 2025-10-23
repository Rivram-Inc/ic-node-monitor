#!/usr/bin/env python3
"""
IC Node Rewards Collection Service

This service automatically:
1. Runs the DRE CLI tool to generate rewards data
2. Parses the CSV output
3. Fetches price conversion rates
4. Updates the PostgreSQL database
"""
import os
import sys
import time
import logging
import signal
from datetime import datetime, date
from typing import Dict
import shutil

# Add the rewards_service directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from dre_runner import DRERunner
from csv_parser import CSVParser
from price_service import PriceService
from database_writer import DatabaseWriter


# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('/var/log/rewards-service.log')
    ]
)
logger = logging.getLogger(__name__)


class RewardsCollectionService:
    def __init__(self, config: Dict):
        """
        Initialize the Rewards Collection Service.
        
        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.running = True
        
        # Initialize components
        self.dre_runner = DRERunner(
            config['dre_path'],
            config['output_dir']
        )
        self.csv_parser = CSVParser()
        self.price_service = PriceService()
        self.db_writer = DatabaseWriter(config['db_config'])
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully."""
        logger.info(f"Received signal {signum}, shutting down...")
        self.running = False
    
    def run_collection_cycle(self) -> bool:
        """
        Execute one complete collection cycle.
        
        Returns:
            True if successful, False otherwise
        """
        logger.info("=" * 70)
        logger.info("STARTING REWARDS COLLECTION CYCLE")
        logger.info(f"Timestamp: {datetime.now().isoformat()}")
        logger.info("=" * 70)
        
        output_path = None
        
        try:
            # Step 1: Verify DRE installation
            logger.info("Step 1: Verifying DRE installation...")
            if not self.dre_runner.verify_dre_installation():
                logger.error("DRE installation verification failed")
                return False
            logger.info("✓ DRE installation verified")
            
            # Step 2: Run DRE command
            logger.info("Step 2: Running DRE command...")
            result = self.dre_runner.run_rewards_generation()
            
            if not result['success']:
                logger.error(f"DRE command failed: {result['error']}")
                return False
            
            output_path = result['output_path']
            logger.info(f"✓ DRE output generated at: {output_path}")
            
            # Step 3: Connect to database
            logger.info("Step 3: Connecting to database...")
            self.db_writer.connect()
            self.db_writer.ensure_tables_exist()
            logger.info("✓ Database connected and tables verified")
            
            # Step 4: Get latest existing data date
            latest_date = self.db_writer.get_latest_data_date()
            if latest_date:
                logger.info(f"Latest existing data: {latest_date}")
            else:
                logger.info("No existing data in database")
            
            # Step 5: Process node provider data
            logger.info("Step 4: Processing node provider data...")
            provider_dirs = self.csv_parser.get_node_provider_dirs(output_path)
            
            if not provider_dirs:
                logger.error("No node provider directories found")
                return False
            
            logger.info(f"Found {len(provider_dirs)} node providers")
            
            stats = {
                'providers_processed': 0,
                'providers_failed': 0,
                'node_metrics': 0,
                'summaries_generated': 0,
            }
            
            for node_provider_id in provider_dirs:
                try:
                    logger.info(f"\nProcessing provider: {node_provider_id}")
                    provider_dir = os.path.join(output_path, node_provider_id)
                    
                    # Parse node metrics CSV
                    csv_path = os.path.join(provider_dir, 'node_metrics_by_node.csv')
                    
                    if not os.path.exists(csv_path):
                        logger.warning(f"  ⚠ node_metrics_by_node.csv not found for {node_provider_id}")
                        stats['providers_failed'] += 1
                        continue
                    
                    # Collect all records
                    records = list(self.csv_parser.parse_node_metrics(csv_path))
                    
                    if not records:
                        logger.warning(f"  ⚠ No records found for {node_provider_id}")
                        stats['providers_failed'] += 1
                        continue
                    
                    logger.info(f"  Parsed {len(records)} records")
                    
                    # Insert/update node metrics
                    count = self.db_writer.upsert_node_metrics(node_provider_id, records)
                    stats['node_metrics'] += count
                    logger.info(f"  ✓ Upserted {count} node metrics")
                    
                    # Generate provider summaries for each unique day
                    unique_days = set(r['day_utc'] for r in records if r['day_utc'])
                    for day in sorted(unique_days):
                        self.db_writer.generate_provider_summary(node_provider_id, day)
                        stats['summaries_generated'] += 1
                    
                    logger.info(f"  ✓ Generated {len(unique_days)} daily summaries")
                    stats['providers_processed'] += 1
                    
                except Exception as e:
                    logger.error(f"  ✗ Failed to process {node_provider_id}: {e}", exc_info=True)
                    stats['providers_failed'] += 1
                    continue
            
            # Step 6: Fetch and store conversion rates
            logger.info("\nStep 5: Fetching conversion rates...")
            try:
                rates = self.price_service.get_xdr_to_icp_rate()
                if rates:
                    self.db_writer.upsert_conversion_rate(date.today(), rates)
                    logger.info(f"✓ XDR to ICP rate: {rates['xdr_to_icp']:.6f}")
                else:
                    logger.warning("⚠ Failed to fetch conversion rates")
            except Exception as e:
                logger.error(f"✗ Failed to process conversion rates: {e}")
            
            # Step 7: Cleanup
            if self.config.get('cleanup_csv', False) and output_path:
                logger.info("\nStep 6: Cleaning up temporary files...")
                try:
                    shutil.rmtree(output_path)
                    logger.info(f"✓ Cleaned up: {output_path}")
                except Exception as e:
                    logger.warning(f"⚠ Failed to cleanup files: {e}")
            
            # Print summary
            logger.info("\n" + "=" * 70)
            logger.info("COLLECTION CYCLE COMPLETED SUCCESSFULLY")
            logger.info("=" * 70)
            logger.info(f"Providers processed: {stats['providers_processed']}")
            logger.info(f"Providers failed: {stats['providers_failed']}")
            logger.info(f"Node metrics records: {stats['node_metrics']}")
            logger.info(f"Provider summaries: {stats['summaries_generated']}")
            logger.info("=" * 70)
            
            return True
            
        except Exception as e:
            logger.error(f"Collection cycle failed with unexpected error: {e}", exc_info=True)
            return False
        
        finally:
            try:
                self.db_writer.close()
            except:
                pass
    
    def run_daemon(self, interval_hours: int = 24):
        """
        Run service in daemon mode.
        
        Args:
            interval_hours: Hours between collection cycles
        """
        logger.info("=" * 70)
        logger.info("STARTING REWARDS COLLECTION SERVICE IN DAEMON MODE")
        logger.info(f"Collection interval: {interval_hours} hours")
        logger.info("=" * 70)
        
        while self.running:
            try:
                success = self.run_collection_cycle()
                
                if success:
                    logger.info(f"\n✓ Next collection scheduled in {interval_hours} hours")
                    next_run = datetime.now().timestamp() + (interval_hours * 3600)
                else:
                    # On failure, retry in 1 hour
                    logger.error(f"\n✗ Collection failed, will retry in 1 hour")
                    next_run = datetime.now().timestamp() + 3600
                
                # Sleep with periodic checks for shutdown signal
                while self.running and datetime.now().timestamp() < next_run:
                    time.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Daemon loop error: {e}", exc_info=True)
                logger.info("Waiting 5 minutes before retry...")
                time.sleep(300)
        
        logger.info("Service shutdown complete")
    
    def run_once(self) -> bool:
        """
        Run a single collection cycle and exit.
        
        Returns:
            True if successful, False otherwise
        """
        return self.run_collection_cycle()


def load_config() -> Dict:
    """
    Load configuration from environment variables.
    
    Returns:
        Configuration dictionary
    """
    return {
        'dre_path': os.environ.get('DRE_PATH', '/opt/dre'),
        'output_dir': os.environ.get('OUTPUT_DIR', '/tmp/rewards-output'),
        'cleanup_csv': os.environ.get('CLEANUP_CSV', 'true').lower() == 'true',
        'db_config': {
            'dbname': os.environ.get('DB_NAME', 'ic_node_monitor'),
            'user': os.environ.get('DB_USER', 'postgres'),
            'password': os.environ.get('DB_PASS', ''),
            'host': os.environ.get('DB_HOST', 'localhost'),
            'port': int(os.environ.get('DB_PORT', '5432')),
        }
    }


def main():
    """Main entry point."""
    config = load_config()
    
    # Log configuration (without password)
    logger.info("Configuration:")
    logger.info(f"  DRE Path: {config['dre_path']}")
    logger.info(f"  Output Dir: {config['output_dir']}")
    logger.info(f"  Cleanup CSV: {config['cleanup_csv']}")
    logger.info(f"  Database: {config['db_config']['user']}@{config['db_config']['host']}:{config['db_config']['port']}/{config['db_config']['dbname']}")
    
    service = RewardsCollectionService(config)
    
    # Check command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == '--daemon':
            interval = int(sys.argv[2]) if len(sys.argv) > 2 else 24
            service.run_daemon(interval_hours=interval)
        elif sys.argv[1] == '--help':
            print("Usage:")
            print("  python rewards_service.py              # Run once and exit")
            print("  python rewards_service.py --daemon     # Run as daemon (default: 24h interval)")
            print("  python rewards_service.py --daemon 12  # Run as daemon with 12h interval")
            sys.exit(0)
        else:
            print(f"Unknown argument: {sys.argv[1]}")
            print("Use --help for usage information")
            sys.exit(1)
    else:
        # Run once
        success = service.run_once()
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()


