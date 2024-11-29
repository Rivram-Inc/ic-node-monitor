from icmplib import ping, traceroute


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
    print(f'Ping Host Details: {host}')
    print(f'Address: {host.address}')
    print(f'Avg RTT: {host.avg_rtt} ms')
    print(f'Packets Sent: {host.packets_sent}')
    print(f'Packets Received: {host.packets_received}')
    print(f'Loss Percentage: {host.packet_loss}%')

    # Perform the traceroute
    print('\nTraceroute Details:')
    # hops = traceroute(host.address, count=1, interval=1,
                    #   max_hops=30, timeout=2)

    # Structure the traceroute data
    traceroute_data = []
    # for hop in hops:
    #     print(
    #         f'  Hop {hop.distance}: Address: {hop.address}, RTT: {hop.avg_rtt} ms')
    #     traceroute_data.append({
    #         "hop_number": hop.distance,
    #         "ip_address": hop.address,
    #         "rtt": hop.avg_rtt
    #     })

    # Return a structured dictionary containing both ping and traceroute data
    return (host, traceroute_data)
