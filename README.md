# ic-node-monitor

## To start master ingestion server:

1. Add required env. variables
2. Install dependencies `pip install -r requirements.txt`
3. run:
   ```sh
   $ cd metric_collector
   $ uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

## To start metric probe:

1. Add required env. variables
2. Install dependencies `pip install -r requirements.txt`
3. run:
   ```sh
   $ cd metric_probe
   $ python3 probe.py
   ```

## Architectural diagram:

![Architectural Diagram](assets/ic_node_monitoring_architectural_diagram.png)
