import os
import logging
from icmplib import ping, traceroute

env = os.getenv('ENV', 'dev')  # Defaults to 'dev' if not set

env_file = f".env.{env}"

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(f"{env}.log"),  # Logs to a file
        logging.StreamHandler()               # Logs to the console
    ]
)


def ping_util(ip_address):
    """
    Perform a ping and traceroute for the given IP address.

    Args:
        ip_address (str): The IP address to ping and trace.

    Returns:
        tuple: A tuple containing:
            - host: The ping results as a Host object.
            - traceroute_data: A list of dictionaries, each representing a hop in the traceroute.
    """
    # Perform the ping
    host = ping(ip_address, count=4, interval=0.2)
    logging.info({
        "message": "Ping Host Details",
        "address": host.address,
        "avg_rtt": host.avg_rtt,
        "packets_sent": host.packets_sent,
        "packets_received": host.packets_received,
        "packet_loss": host.packet_loss
    })

    # Perform the traceroute
    hops = traceroute(host.address, count=1, interval=1,
                      max_hops=10, timeout=2)

    # Structure the traceroute data
    traceroute_data = [{"hop_number": hop.distance,
                        "ip_address": hop.address, "rtt": hop.avg_rtt} for hop in hops]

    # Return a structured dictionary containing both ping and traceroute data
    return (host, traceroute_data)
