from icmplib import ping, traceroute


def ping_util(ip_address):
    host = ping(ip_address, count=4, interval=0.2)
    print(f'Ping Host Details: {host}')
    print(f'Address: {host.address}')
    print(f'Avg RTT: {host.avg_rtt} ms')
    print(f'Packets Sent: {host.packets_sent}')
    print(f'Packets Received: {host.packets_received}')
    print(f'Loss Percentage: {host.packet_loss}%')
    return host
