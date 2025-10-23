# Rewards Collection Service

Automated Python service for collecting IC node rewards data from the DRE tool.

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set environment variables
export DRE_PATH="/path/to/dre"
export OUTPUT_DIR="/tmp/rewards-output"
export DB_NAME="ic_node_monitor"
export DB_USER="postgres"
export DB_PASS="your_password"
export DB_HOST="localhost"
export DB_PORT="5432"

# 3. Run once
python3 rewards_service.py

# 4. Or run as daemon (every 24 hours)
python3 rewards_service.py --daemon 24
```

## Components

- **`rewards_service.py`** - Main orchestrator
- **`dre_runner.py`** - Executes DRE CLI commands
- **`csv_parser.py`** - Parses generated CSV files
- **`price_service.py`** - Fetches XDR→ICP rates from CoinGecko
- **`database_writer.py`** - Writes to PostgreSQL

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DRE_PATH` | Path to DRE tool directory | `/opt/dre` |
| `OUTPUT_DIR` | Temporary output directory | `/tmp/rewards-output` |
| `CLEANUP_CSV` | Delete CSV after processing | `true` |
| `DB_NAME` | PostgreSQL database name | `ic_node_monitor` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASS` | Database password | (required) |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |

## Production Deployment

### Using Systemd

```bash
# 1. Edit rewards-collector.service with your paths
sudo nano rewards-collector.service

# 2. Install service
sudo cp rewards-collector.service /etc/systemd/system/
sudo systemctl daemon-reload

# 3. Enable and start
sudo systemctl enable rewards-collector
sudo systemctl start rewards-collector

# 4. Check status
sudo systemctl status rewards-collector
sudo journalctl -u rewards-collector -f
```

### Using Cron

```bash
# Run daily at 2 AM
crontab -e

# Add:
0 2 * * * cd /path/to/rewards_service && /usr/bin/python3 rewards_service.py >> /var/log/rewards.log 2>&1
```

## Database Tables

The service creates and maintains:

1. **`node_reward_metrics`** - Daily node-level data
2. **`node_provider_daily_summary`** - Provider aggregations  
3. **`xdr_icp_conversion_rates`** - Currency conversion rates

Tables are created automatically on first run.

## Monitoring

**View logs:**
```bash
# Systemd
sudo journalctl -u rewards-collector -f

# File
tail -f /var/log/rewards-service.log
```

**Check data:**
```sql
-- Latest data
SELECT MAX(day_utc) FROM node_reward_metrics;

-- Record counts
SELECT COUNT(*) as records,
       COUNT(DISTINCT node_provider_id) as providers,
       COUNT(DISTINCT node_id) as nodes
FROM node_reward_metrics;
```

## Troubleshooting

### Service fails to start
1. Check DRE path: `ls -la $DRE_PATH`
2. Test cargo: `cargo --version`
3. Test database: `psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1"`

### DRE command fails
1. Test manually: `cd $DRE_PATH && cargo run --bin dre node-rewards ongoing --csv-detailed-output-path /tmp/test`
2. Check permissions on OUTPUT_DIR
3. Check service logs for stderr

### No data inserted
1. Check CSV files are generated in OUTPUT_DIR
2. Verify database connection
3. Check parsing errors in logs
4. Verify CSV file format

### Price API failures
- Service continues without conversion rates
- Check network access to api.coingecko.com
- Check CoinGecko API rate limits

## Service Workflow

```
1. Execute DRE CLI → Generate CSV files (per provider)
2. Parse CSV files → Extract metrics
3. Fetch prices → Get XDR/ICP rates from CoinGecko
4. Calculate → Compute failure rates, aggregations
5. Write → Batch insert/update to database
6. Cleanup → Remove CSV files (if CLEANUP_CSV=true)
```

## Performance

- Typical runtime: 5-15 minutes (depends on number of providers)
- CSV processing: ~1000 records/second
- Database writes: Batch inserts for efficiency
- Memory usage: ~200MB peak

## Notes

- XDR amounts stored as permyriad (divide by 10,000 for display)
- Dates stored in UTC
- Service uses `ON CONFLICT DO UPDATE` for idempotency
- Historical data retained indefinitely
- Price conversion failures are non-critical

## Development

```bash
# Test individual components
python3 -c "from dre_runner import DRERunner; print('OK')"
python3 -c "from csv_parser import CSVParser; print('OK')"
python3 -c "from price_service import PriceService; print('OK')"
python3 -c "from database_writer import DatabaseWriter; print('OK')"
```
