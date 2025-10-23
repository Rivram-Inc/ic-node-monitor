"""
DRE Runner Component
Handles execution of the DRE CLI tool.
"""
import subprocess
import os
from typing import Dict, Optional
import logging
from datetime import datetime


class DRERunner:
    def __init__(self, dre_path: str, output_base_dir: str):
        """
        Initialize DRE Runner.
        
        Args:
            dre_path: Path to the DRE tool directory
            output_base_dir: Base directory for output files
        """
        self.dre_path = dre_path
        self.output_base_dir = output_base_dir
        self.logger = logging.getLogger(__name__)
    
    def run_rewards_generation(self) -> Dict[str, any]:
        """
        Run DRE command and return path to output directory.
        
        Returns:
            Dict with 'success', 'output_path', 'error', 'stdout', 'stderr'
        """
        # Create timestamped output directory
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_path = os.path.join(self.output_base_dir, f'rewards_{timestamp}')
        os.makedirs(output_path, exist_ok=True)
        
        try:
            self.logger.info(f"Running DRE command with output path: {output_path}")
            
            # Run DRE command
            cmd = [
                'cargo', 'run', '--bin', 'dre', 
                'node-rewards', 'ongoing',
                '--csv-detailed-output-path', output_path
            ]
            
            self.logger.debug(f"Executing: {' '.join(cmd)}")
            
            result = subprocess.run(
                cmd,
                cwd=self.dre_path,
                capture_output=True,
                text=True,
                timeout=900  # 15 minutes timeout
            )
            
            if result.returncode == 0:
                self.logger.info("DRE command completed successfully")
                self.logger.debug(f"Output: {result.stdout[:500]}...")  # First 500 chars
                
                return {
                    'success': True,
                    'output_path': output_path,
                    'error': None,
                    'stdout': result.stdout,
                    'stderr': result.stderr
                }
            else:
                self.logger.error(f"DRE command failed with return code {result.returncode}")
                self.logger.error(f"stderr: {result.stderr}")
                
                return {
                    'success': False,
                    'output_path': None,
                    'error': f"Return code {result.returncode}: {result.stderr}",
                    'stdout': result.stdout,
                    'stderr': result.stderr
                }
                
        except subprocess.TimeoutExpired:
            self.logger.error("DRE command timed out")
            return {
                'success': False,
                'output_path': None,
                'error': 'Command timed out after 15 minutes',
                'stdout': None,
                'stderr': None
            }
        except FileNotFoundError:
            self.logger.error(f"DRE path not found: {self.dre_path}")
            return {
                'success': False,
                'output_path': None,
                'error': f'DRE path not found: {self.dre_path}',
                'stdout': None,
                'stderr': None
            }
        except Exception as e:
            self.logger.error(f"Failed to run DRE command: {e}", exc_info=True)
            return {
                'success': False,
                'output_path': None,
                'error': str(e),
                'stdout': None,
                'stderr': None
            }
    
    def verify_dre_installation(self) -> bool:
        """
        Verify that DRE tool is properly installed.
        
        Returns:
            True if DRE is available, False otherwise
        """
        try:
            result = subprocess.run(
                ['cargo', '--version'],
                cwd=self.dre_path,
                capture_output=True,
                timeout=10
            )
            return result.returncode == 0
        except Exception as e:
            self.logger.error(f"DRE verification failed: {e}")
            return False
