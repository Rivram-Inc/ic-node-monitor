from ping_util import ping_util
import requests
import json
import os
from datetime import datetime
from jose import jwt

# JWT token configs: secret key and algorithm
# this secret match JWT secret in script

env = os.getenv('ENV', 'dev')  # Defaults to 'dev' if not set
MASTER_INGESTION_URL = os.getenv('MASTER_INGESTION_URL')
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')
PROBE_NAME = os.getenv('PROBE_NAME')  # take probe name from env variable

print(f'Probe name: {PROBE_NAME}')
# if probe name is not available, exit the program
if PROBE_NAME is None:
    print("Missing probe name!")
    exit(1)

print(f'Environment: {env}')


def generate_token():
    payload = {
        "sub": "my_service",
        "iat": datetime.utcnow().timestamp()
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return token


# Get the token
token = generate_token()
print(f"Generated token: {token}")

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
    print("No nodes available.")
else:
    for node in nodes:
        ip_address = node[3]
        # print(f'Pinging {ip_address}...')
        ping_response = ping_util(ip_address)
        print(ping_response)

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
                print(
                    f"Ping result for {ip_address} successfully sent to API.")
            else:
                print(
                    f"Failed to send ping result for {ip_address}. Status code: {response.status_code}")
                print(f"Response: {response.text}")

        except requests.exceptions.RequestException as e:
            print(f"Error sending ping result for {ip_address}: {e}")
