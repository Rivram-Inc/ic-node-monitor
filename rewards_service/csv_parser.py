"""
CSV Parser Component
Handles parsing of DRE CSV output files.
"""
import csv
import os
from typing import List, Dict, Generator, Optional
from datetime import datetime
import logging


class CSVParser:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse DD-MM-YYYY to datetime."""
        if not date_str or date_str.strip() == '':
            return None
        try:
            return datetime.strptime(date_str, "%d-%m-%Y")
        except ValueError:
            self.logger.warning(f"Failed to parse date: {date_str}")
            return None
    
    def safe_int(self, value: str) -> int:
        """Safely convert string to int."""
        if not value or value.strip() == '':
            return 0
        try:
            return int(value)
        except ValueError:
            return 0
    
    def safe_float(self, value: str) -> float:
        """Safely convert string to float."""
        if not value or value.strip() == '':
            return 0.0
        try:
            return float(value)
        except ValueError:
            return 0.0
    
    def parse_node_metrics(self, csv_path: str) -> Generator[Dict, None, None]:
        """
        Parse node_metrics_by_node.csv and yield records.
        
        Yields:
            Dict containing node metrics for a single node on a single day
        """
        if not os.path.exists(csv_path):
            self.logger.warning(f"File not found: {csv_path}")
            return
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                for row_num, row in enumerate(reader, start=2):  # Start at 2 (header is 1)
                    try:
                        # Calculate failure rate
                        proposed = self.safe_int(row.get('num_blocks_proposed', '0'))
                        failed = self.safe_int(row.get('num_blocks_failed', '0'))
                        total = proposed + failed
                        failure_rate = (failed / total * 100) if total > 0 else 0.0
                        
                        yield {
                            'node_id': row['node_id'],
                            'day_utc': self.parse_date(row['day_utc']),
                            'node_status': row.get('node_status', ''),
                            'node_reward_type': row.get('node_reward_type', ''),
                            'region': row.get('region', ''),
                            'dc_id': row.get('dc_id', ''),
                            'performance_multiplier': self.safe_float(row.get('performance_multiplier', '1')),
                            'rewards_reduction': self.safe_float(row.get('rewards_reduction', '0')),
                            'base_rewards_xdr_permyriad': self.safe_int(row.get('base_rewards_xdr_permyriad', '0')),
                            'adjusted_rewards_xdr_permyriad': self.safe_int(row.get('adjusted_rewards_xdr_permyriad', '0')),
                            'subnet_assigned': row.get('subnet_assigned', '') or None,
                            'num_blocks_proposed': proposed,
                            'num_blocks_failed': failed,
                            'daily_failure_rate': failure_rate,
                        }
                    except Exception as e:
                        self.logger.error(f"Error parsing row {row_num} in {csv_path}: {e}")
                        continue
        
        except Exception as e:
            self.logger.error(f"Error reading CSV file {csv_path}: {e}")
    
    def parse_rewards_summary(self, csv_path: str) -> Generator[Dict, None, None]:
        """
        Parse rewards_summary.csv and yield records.
        
        Yields:
            Dict containing summary data for a single day
        """
        if not os.path.exists(csv_path):
            self.logger.warning(f"File not found: {csv_path}")
            return
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                for row in reader:
                    try:
                        yield {
                            'day_utc': self.parse_date(row['day_utc']),
                            'rewards_total_xdr_permyriad': self.safe_int(row.get('rewards_total_xdr_permyriad', '0')),
                            'nodes_in_registry': self.safe_int(row.get('nodes_in_registry', '0')),
                            'assigned_nodes': self.safe_int(row.get('assigned_nodes', '0')),
                            'underperforming_nodes_count': self.safe_int(row.get('underperforming_nodes_count', '0')),
                            'underperforming_nodes': row.get('underperforming_nodes', ''),
                        }
                    except Exception as e:
                        self.logger.error(f"Error parsing rewards summary row: {e}")
                        continue
        
        except Exception as e:
            self.logger.error(f"Error reading CSV file {csv_path}: {e}")
    
    def get_node_provider_dirs(self, output_path: str) -> List[str]:
        """
        Get list of node provider directories from DRE output.
        
        Args:
            output_path: Path to DRE output directory
            
        Returns:
            List of node provider IDs
        """
        if not os.path.exists(output_path):
            self.logger.error(f"Output path not found: {output_path}")
            return []
        
        try:
            dirs = [
                d for d in os.listdir(output_path)
                if os.path.isdir(os.path.join(output_path, d))
                and not d.startswith('.')  # Skip hidden directories
            ]
            return dirs
        except Exception as e:
            self.logger.error(f"Error listing node provider directories: {e}")
            return []


