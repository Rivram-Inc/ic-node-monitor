"""
Price Service Component
Handles fetching of XDR and ICP price data.
"""
import requests
from typing import Optional, Dict
from datetime import datetime, date
import logging
import time


class PriceService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.cache = {}
        self.coingecko_base_url = "https://api.coingecko.com/api/v3"
    
    def get_xdr_to_icp_rate(self, target_date: date = None) -> Optional[Dict]:
        """
        Get XDR to ICP conversion rate for a specific date.
        
        Args:
            target_date: Date for which to get the rate (defaults to today)
        
        Returns:
            {
                'xdr_to_usd': float,
                'icp_to_usd': float,
                'xdr_to_icp': float,
                'source': str
            }
        """
        if target_date is None:
            target_date = date.today()
        
        # Check cache
        cache_key = target_date.isoformat()
        if cache_key in self.cache:
            self.logger.debug(f"Using cached rate for {cache_key}")
            return self.cache[cache_key]
        
        try:
            # Get XDR to USD rate
            xdr_to_usd = self._get_xdr_rate(target_date)
            
            # Get ICP to USD rate
            if target_date == date.today():
                icp_to_usd = self._get_icp_rate_current()
            else:
                icp_to_usd = self._get_icp_rate_historical(target_date)
            
            if xdr_to_usd and icp_to_usd:
                xdr_to_icp = xdr_to_usd / icp_to_usd
                
                result = {
                    'xdr_to_usd': xdr_to_usd,
                    'icp_to_usd': icp_to_usd,
                    'xdr_to_icp': xdr_to_icp,
                    'source': 'coingecko'
                }
                
                self.cache[cache_key] = result
                self.logger.info(f"Fetched conversion rate for {cache_key}: {xdr_to_icp:.4f} XDR/ICP")
                return result
            
        except Exception as e:
            self.logger.error(f"Failed to get conversion rate: {e}", exc_info=True)
        
        return None
    
    def _get_xdr_rate(self, target_date: date) -> Optional[float]:
        """
        Get XDR to USD rate.
        
        Note: XDR is a basket currency by IMF. For now using approximate value.
        TODO: Integrate with IMF API or other source for accurate rates.
        
        Args:
            target_date: Date for the rate
            
        Returns:
            XDR to USD rate
        """
        # XDR rate is relatively stable, typically around 1.40 USD
        # This should ideally be fetched from IMF or similar source
        # For production, implement proper XDR rate fetching
        
        self.logger.debug("Using approximate XDR rate of 1.40 USD")
        return 1.40
    
    def _get_icp_rate_current(self) -> Optional[float]:
        """
        Get current ICP to USD rate from CoinGecko.
        
        Returns:
            Current ICP price in USD
        """
        try:
            url = f"{self.coingecko_base_url}/simple/price"
            params = {
                'ids': 'internet-computer',
                'vs_currencies': 'usd'
            }
            
            self.logger.debug(f"Fetching current ICP rate from CoinGecko")
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            icp_usd = data['internet-computer']['usd']
            
            self.logger.info(f"Current ICP rate: ${icp_usd:.4f}")
            return icp_usd
            
        except requests.RequestException as e:
            self.logger.error(f"Failed to fetch current ICP rate: {e}")
            return None
        except (KeyError, ValueError) as e:
            self.logger.error(f"Failed to parse ICP rate response: {e}")
            return None
    
    def _get_icp_rate_historical(self, target_date: date) -> Optional[float]:
        """
        Get historical ICP to USD rate for a specific date from CoinGecko.
        
        Args:
            target_date: Date for which to get the rate
            
        Returns:
            Historical ICP price in USD
        """
        try:
            # CoinGecko expects format: DD-MM-YYYY
            date_str = target_date.strftime('%d-%m-%Y')
            
            url = f"{self.coingecko_base_url}/coins/internet-computer/history"
            params = {
                'date': date_str,
                'localization': 'false'
            }
            
            self.logger.debug(f"Fetching historical ICP rate for {date_str} from CoinGecko")
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            icp_usd = data['market_data']['current_price']['usd']
            
            self.logger.info(f"Historical ICP rate for {date_str}: ${icp_usd:.4f}")
            return icp_usd
            
        except requests.RequestException as e:
            self.logger.error(f"Failed to fetch historical ICP rate: {e}")
            # Fallback to current rate if historical data not available
            self.logger.warning(f"Falling back to current rate for {target_date}")
            return self._get_icp_rate_current()
        except (KeyError, ValueError) as e:
            self.logger.error(f"Failed to parse historical ICP rate response: {e}")
            return self._get_icp_rate_current()
    
    def clear_cache(self):
        """Clear the price cache."""
        self.cache = {}
        self.logger.info("Price cache cleared")


