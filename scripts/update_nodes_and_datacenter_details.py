import requests
import psycopg2
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Set up environment and logging
env = os.getenv("ENV", "dev")  # Default to 'dev' if not set

# Set up script directory and log file
script_dir = Path(__file__).resolve().parent
log_file = script_dir / f"{env}.node_importer.log"
env_file = script_dir / f".env.{env}"

# Ensure log file exists
log_path = Path(log_file)
if not log_path.exists():
    log_path.touch()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(log_file),  # Logs to file
        logging.StreamHandler()         # Also log to console
    ]
)

# Load environment-specific variables
dotenv_path = Path(env_file)
if dotenv_path.exists():
    load_dotenv(dotenv_path)
    logging.info(f"Loaded environment variables from {env_file}")
else:
    logging.warning(f"Environment file {env_file} not found. Using default environment variables.")

# Database configuration from environment
DATABASE_CONFIG = {
    "database": os.getenv("DATABASE_NAME", "postgres"),
    "host": os.getenv("DATABASE_HOST", "127.0.0.1"),
    "user": os.getenv("DATABASE_USER", "postgres"),
    "password": os.getenv("DATABASE_PASSWORD", "postgres"),
    "port": os.getenv("DATABASE_PORT", "5439")
}

def get_db_connection():
    """Establish and return a database connection"""
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        logging.info("Successfully connected to database")
        return conn
    except psycopg2.Error as e:
        logging.error(f"Database connection failed: {e}")
        raise

def create_tables(conn):
    """Create both nodes and data_centers tables with proper constraints"""
    try:
        with conn.cursor() as cursor:
            # Create data_centers table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS data_centers (
                    id SERIAL PRIMARY KEY,
                    dc_key TEXT UNIQUE NOT NULL,
                    dc_name TEXT,
                    latitude NUMERIC,
                    longitude NUMERIC,
                    node_providers INTEGER,
                    owner TEXT,
                    region TEXT,
                    total_nodes INTEGER
                )
            ''')
            
            # Create nodes table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS nodes (
                    id SERIAL PRIMARY KEY,
                    dc_id TEXT,
                    dc_name TEXT,
                    ip_address INET UNIQUE NOT NULL,
                    node_id TEXT,
                    node_operator_id TEXT,
                    node_provider_id TEXT,
                    node_provider_name TEXT,
                    node_type TEXT,
                    owner TEXT,
                    region TEXT,
                    status TEXT,
                    subnet_id TEXT
                )
            ''')
            conn.commit()
            logging.info("Tables created/verified successfully")
    except psycopg2.Error as e:
        logging.error(f"Table creation failed: {e}")
        conn.rollback()
        raise

def upsert_data_centers(conn, data_centers):
    """UPSERT operation for data centers"""
    try:
        with conn.cursor() as cursor:
            for dc in data_centers:
                cursor.execute('''
                    INSERT INTO data_centers (
                        dc_key, dc_name, latitude, longitude, 
                        node_providers, owner, region, total_nodes
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (dc_key) DO UPDATE SET
                        dc_name = EXCLUDED.dc_name,
                        latitude = EXCLUDED.latitude,
                        longitude = EXCLUDED.longitude,
                        node_providers = EXCLUDED.node_providers,
                        owner = EXCLUDED.owner,
                        region = EXCLUDED.region,
                        total_nodes = EXCLUDED.total_nodes
                ''', (
                    dc['key'], dc['name'], dc['latitude'], dc['longitude'],
                    dc['node_providers'], dc['owner'], dc['region'], dc['total_nodes']
                ))
            conn.commit()
            logging.info(f"Upserted {len(data_centers)} data centers")
    except psycopg2.Error as e:
        logging.error(f"Data centers upsert failed: {e}")
        conn.rollback()
        raise

def upsert_nodes(conn, nodes):
    """UPSERT operation for nodes"""
    try:
        with conn.cursor() as cursor:
            for node in nodes:
                cursor.execute('''
                    INSERT INTO nodes (
                        dc_id, dc_name, ip_address, node_id, node_operator_id, 
                        node_provider_id, node_provider_name, node_type, 
                        owner, region, status, subnet_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (ip_address) DO UPDATE SET
                        dc_id = EXCLUDED.dc_id,
                        dc_name = EXCLUDED.dc_name,
                        node_id = EXCLUDED.node_id,
                        node_operator_id = EXCLUDED.node_operator_id,
                        node_provider_id = EXCLUDED.node_provider_id,
                        node_provider_name = EXCLUDED.node_provider_name,
                        node_type = EXCLUDED.node_type,
                        owner = EXCLUDED.owner,
                        region = EXCLUDED.region,
                        status = EXCLUDED.status,
                        subnet_id = EXCLUDED.subnet_id
                ''', (
                    node['dc_id'], node['dc_name'], node['ip_address'], node['node_id'],
                    node['node_operator_id'], node['node_provider_id'], node['node_provider_name'],
                    node['node_type'], node['owner'], node['region'], node['status'], node.get('subnet_id')
                ))
            conn.commit()
            logging.info(f"Upserted {len(nodes)} nodes")
    except psycopg2.Error as e:
        logging.error(f"Nodes upsert failed: {e}")
        conn.rollback()
        raise

def cleanup_stale_nodes(conn, current_ip_addresses):
    """Remove nodes that are not in the current API response"""
    if not current_ip_addresses:
        logging.warning("No current IP addresses provided for cleanup")
        return 0
        
    try:
        with conn.cursor() as cursor:
            # Delete nodes that are not in the current API response
            cursor.execute('''
                DELETE FROM nodes 
                WHERE ip_address NOT IN %s
            ''', (tuple(current_ip_addresses),))
            
            deleted_count = cursor.rowcount
            conn.commit()
            logging.info(f"Cleaned up {deleted_count} stale nodes")
            return deleted_count
    except psycopg2.Error as e:
        logging.error(f"Node cleanup failed: {e}")
        conn.rollback()
        raise

def cleanup_stale_data_centers(conn, current_dc_keys):
    """Remove data centers that are not in the current API response"""
    if not current_dc_keys:
        logging.warning("No current data center keys provided for cleanup")
        return 0
        
    try:
        with conn.cursor() as cursor:
            # Delete data centers that are not in the current API response
            cursor.execute('''
                DELETE FROM data_centers 
                WHERE dc_key NOT IN %s
            ''', (tuple(current_dc_keys),))
            
            deleted_count = cursor.rowcount
            conn.commit()
            logging.info(f"Cleaned up {deleted_count} stale data centers")
            return deleted_count
    except psycopg2.Error as e:
        logging.error(f"Data center cleanup failed: {e}")
        conn.rollback()
        raise

def fetch_data_centers():
    """Fetch data centers from API"""
    url = 'https://ic-api.internetcomputer.org/api/v3/data-centers'
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json().get('data_centers', [])
        logging.info(f"Fetched {len(data)} data centers from API")
        return data
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to fetch data centers: {e}")
        raise

def fetch_nodes():
    """Fetch nodes from API"""
    url = 'https://ic-api.internetcomputer.org/api/v3/nodes'
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json().get('nodes', [])
        logging.info(f"Fetched {len(data)} nodes from API")
        return data
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to fetch nodes: {e}")
        raise

def main():
    conn = None
    try:
        logging.info("Starting node importer script")
        
        conn = get_db_connection()
        create_tables(conn)

        # Process data centers
        data_centers = fetch_data_centers()
        if data_centers:
            upsert_data_centers(conn, data_centers)
            
            # Extract current data center keys for cleanup
            current_dc_keys = [dc['key'] for dc in data_centers]
            cleanup_stale_data_centers(conn, current_dc_keys)
        else:
            logging.warning("No data centers fetched from API")

        # Process nodes
        nodes = fetch_nodes()
        if nodes:
            upsert_nodes(conn, nodes)
            
            # Extract current IP addresses for cleanup
            current_ip_addresses = [node['ip_address'] for node in nodes]
            cleanup_stale_nodes(conn, current_ip_addresses)
        else:
            logging.warning("No nodes fetched from API")

        logging.info("Node importer completed successfully")
    except Exception as e:
        logging.error(f"Script failed: {e}", exc_info=True)
    finally:
        if conn:
            conn.close()
            logging.info("Database connection closed")

if __name__ == "__main__":
    main()
