# IC Node Monitor

A comprehensive monitoring solution for IC (Internet Computer) nodes, featuring a distributed architecture with metric collection, ingestion, and visualization capabilities.

## Architecture

![Architectural Diagram](assets/ic_node_monitoring_architectural_diagram.png)

The system consists of three main components:
- **Master Ingestion Server**: Central server that receives and processes metrics
- **Metric Probe**: Lightweight agent that collects metrics from nodes
- **Frontend Dashboard**: Web interface for monitoring and visualization

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL with TimescaleDB extension

Note: TimescaleDB is required for materialized views to function properly. The materialized views are specifically written for TimescaleDB. Refer to scripts/sql_commands.txt for database setup commands.

### 1. Master Ingestion Server

The master ingestion server acts as the central hub for collecting metrics from distributed probes.

```bash
# Navigate to the metric collector directory
cd metric_collector

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables (see Configuration section)
cp .env.example .env
# Edit .env with your configuration

# Start the server
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

The server will be available at `http://localhost:8000`

### 2. Metric Probe

The metric probe collects metrics from individual nodes.

```bash
# Navigate to the metric probe directory
cd metric_probe

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables (see Configuration section)
cp .env.example .env
# Edit .env with your configuration

# Start the probe
python3 probe.py
```

### 3. Frontend Dashboard

The web dashboard provides real-time monitoring and historical data visualization.

```bash
# Navigate to the frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the development server
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## Configuration

### Environment Variables

Each component requires specific environment variables for proper configuration:

- **Master Ingestion Server**: Copy `metric_collector/.env.example` to `metric_collector/.env`
- **Metric Probe**: Copy `metric_probe/.env.example` to `metric_probe/.env`  
- **Frontend**: Copy `frontend/.env.example` to `frontend/.env`

Key configuration points:
- Ensure `JWT_SECRET_KEY` and `ALGORITHM` are identical between the ingestion server and metric probe
- `ALGORITHM` can be set to `HS256` (default JWT signing algorithm)
- Set `ENVIRONMENT` to `"dev"` for development or `"prod"` for production deployment
- Configure database connection parameters according to your setup
- Set `MASTER_INGESTION_URL` in the probe configuration to point to your ingestion server

### Database Setup

The system requires a database for storing metrics and configuration. Refer to the database-related environment variables in the `.env.example` files for connection details.

## Production Deployment

For production deployment:

1. Set `ENVIRONMENT="prod"` or `ENV="prod"` in all relevant `.env` files
2. For deployments of ingestion server and probes, pm2 is suggested. Some other process manager will also work.

## Development

### Running in Development Mode

- Set `ENVIRONMENT="dev"` or `ENV="dev"` in all relevant `.env` files

---

## Node Rewards System

The system includes an automated rewards collection service that tracks node performance and rewards data from the DRE tool.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REWARDS COLLECTION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   DRE CLI   │  cargo run --bin dre node-rewards
    └──────┬──────┘
           │
           ↓ Generates CSV files per provider
           │
    ┌──────────────────────────────────┐
    │  Python Service (Daily/Hourly)   │
    │  - Executes DRE                  │
    │  - Parses CSV files              │
    │  - Fetches XDR→ICP rates         │
    │  - Calculates metrics            │
    └──────┬───────────────────────────┘
           │
           ↓ Batch Insert/Update
           │
    ┌──────────────────────────────────┐
    │      PostgreSQL Database         │
    │  ┌────────────────────────────┐  │
    │  │ node_reward_metrics        │  │ ← Node-level daily data
    │  │ node_provider_daily_summary│  │ ← Provider aggregations
    │  │ xdr_icp_conversion_rates   │  │ ← Currency conversion
    │  └────────────────────────────┘  │
    └──────┬───────────────────────────┘
           │
           ↓ Query via API
           │
    ┌──────────────────────────────────┐
    │    Next.js API Routes            │
    │  /api/analytics/nodes/...        │
    │  /api/analytics/providers/...    │
    └──────┬───────────────────────────┘
           │
           ↓ Display
           │
    ┌──────────────────────────────────┐
    │      Frontend Dashboard          │
    │  - Node rewards & performance    │
    │  - Provider summaries            │
    │  - Charts & analytics            │
    └──────────────────────────────────┘
```

### Setup

1. **Install Python Dependencies**
   ```bash
   cd rewards_service
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   # Set these environment variables
   export DRE_PATH="/path/to/dre"
   export OUTPUT_DIR="/tmp/rewards-output"
   export DB_NAME="ic_node_monitor"
   export DB_USER="postgres"
   export DB_PASS="your_password"
   export DB_HOST="localhost"
   export DB_PORT="5432"
   ```

3. **Run Service**
   ```bash
   # One-time run
   python3 rewards_service/rewards_service.py
   
   # Or as daemon (runs every 24 hours)
   python3 rewards_service/rewards_service.py --daemon 24
   ```

4. **Deploy as Service** (Production)
   ```bash
   # Edit service file with your paths
   sudo cp rewards_service/rewards-collector.service /etc/systemd/system/
   sudo systemctl enable rewards-collector
   sudo systemctl start rewards-collector
   ```

### Database Schema

**node_reward_metrics** - Daily metrics per node
- node_id, node_provider_id, day_utc
- node_status (Assigned/Unassigned)
- performance_multiplier, rewards_reduction
- base_rewards_xdr_permyriad, adjusted_rewards_xdr_permyriad
- num_blocks_proposed, num_blocks_failed, daily_failure_rate
- subnet_assigned, dc_id, region

**node_provider_daily_summary** - Daily aggregations per provider
- node_provider_id, day_utc
- total_nodes, assigned_nodes, unassigned_nodes
- expected_rewards_xdr_permyriad, actual_rewards_xdr_permyriad
- total_blocks_proposed, total_blocks_failed, total_failure_rate

**xdr_icp_conversion_rates** - Daily currency conversion
- day_utc, xdr_to_usd, icp_to_usd, xdr_to_icp

### API Endpoints

**Node Rewards**
```bash
GET /api/analytics/nodes/[node-id]/rewards?days=30
```
Returns node metrics and performance summary.

**Provider Rewards**
```bash
GET /api/analytics/providers/[provider-id]/rewards?days=30
```
Returns provider summary with XDR→ICP conversion.

**Provider Nodes Performance**
```bash
GET /api/analytics/providers/[provider-id]/nodes-performance?startDate=2025-10-01&endDate=2025-10-14
```
Returns detailed performance table for all provider nodes.

**Conversion Rates**
```bash
GET /api/analytics/conversion-rates?days=30
```
Returns historical XDR to ICP conversion rates.

### Data Display Features

The system supports displaying all key metrics:

**Node Level:**
- Days Assigned/Unassigned (last 30 days)
- Reward Multiplier
- Total Blocks Proposed/Failed
- Base Monthly Rewards (XDR)
- Block Statistics Chart (time series)
- Reward Reduction Chart (time series)
- Daily Performance (date filtered)

**Provider Level:**
- Last Rewarding Period (date, conversion rate)
- Expected Rewards (XDR & ICP, no reduction)
- Actual Rewards (XDR & ICP)
- Total Failure Rate Chart (time series)
- Node Performance Table (date, node, blocks, failures, rate)

### Troubleshooting

**Service won't start**
- Check DRE_PATH is correct: `ls -la $DRE_PATH`
- Verify cargo is installed: `cargo --version`
- Check database connection: `psql -h $DB_HOST -U $DB_USER -d $DB_NAME`

**No data in database**
- Check service logs: `sudo journalctl -u rewards-collector -f`
- Verify DRE command runs: `cd $DRE_PATH && cargo run --bin dre --help`
- Check output directory: `ls -la $OUTPUT_DIR`

**API returns empty**
- Verify data exists: `SELECT COUNT(*) FROM node_reward_metrics;`
- Check latest date: `SELECT MAX(day_utc) FROM node_reward_metrics;`

For detailed service documentation, see `rewards_service/README.md`.
