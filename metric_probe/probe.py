import os
import json
import logging
import requests
from datetime import datetime
from jose import jwt
from dotenv import load_dotenv
from pathlib import Path
from ping_util import ping_util

env = os.getenv('ENV', 'dev')  # Defaults to 'dev' if not set

# Determine which .env file to load
env_file = f".env.{env}"

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(f"{env}.log"),  # Logs to a file
        # logging.StreamHandler()          # Logs to the console
    ]
)

# Load the environment-specific .env file
dotenv_path = Path(env_file)
if dotenv_path.exists():
    load_dotenv(dotenv_path)
    logging.info(f"Loaded environment variables from {env_file}")
else:
    logging.warning(f"Environment file {env_file} not found. Falling back to default environment variables.")

MASTER_INGESTION_URL = os.getenv('MASTER_INGESTION_URL')
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')
PROBE_NAME = os.getenv('PROBE_NAME')  # take probe name from env variable

logging.info(f'Probe name: {PROBE_NAME}')
# if probe name is not available, exit the program
if PROBE_NAME is None:
    logging.error("Missing probe name!")
    exit(1)


def generate_token():
    payload = {
        "sub": "my_service",
        "iat": datetime.utcnow().timestamp()
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return token


# Get the token
token = generate_token()

# Headers with the Authorization token
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}


def get_nodes_from_api():
    response = requests.get(f"{MASTER_INGESTION_URL}/nodes/", headers=headers)
    if response.status_code == 200:
        data = response.json()
        nodes = data['nodes']
        return nodes
    else:
        return []


nodes = get_nodes_from_api()

# Check if nodes is None
if nodes is None:
    logging.info("No nodes available.")
else:
    for node in nodes:
        ip_address = node[3]
        ping_response = ping_util(ip_address)
        logging.info(ping_response)

        ping_details = ping_response[0]
        traceroute_data = ping_response[1]

        ping_result = {
            "ip_address": ip_address,
            "avg_rtt": ping_details.avg_rtt,
            "packets_sent": ping_details.packets_sent,
            "packets_received": ping_details.packets_received,
            "packet_loss": ping_details.packet_loss,
            "probe_name": PROBE_NAME,
            "traceroute_data": json.dumps(traceroute_data)
        }

        try:
            # Send the ping result data to the API endpoint
            response = requests.post(f"{MASTER_INGESTION_URL}/ping_results/",
                                     headers=headers,
                                     data=json.dumps([ping_result])
                                     )

            # Check if the request was successful
            if response.status_code == 200:
                logging.info(
                    f"Ping result for {ip_address} successfully sent to API.")
            else:
                logging.error(
                    f"Failed to send ping result for {ip_address}. Status code: {response.status_code}")
                logging.error(f"Response: {response.text}")

        except requests.exceptions.RequestException as e:
            logging.error(f"Error sending ping result for {ip_address}: {e}")
