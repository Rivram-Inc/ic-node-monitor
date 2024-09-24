import { NextRequest, NextResponse } from "next/server";
import { Nodes } from "@/app/database/models";
import { QueryTypes } from "sequelize";
import db from "@/app/database/config/database";

const calculateUptime = (packetsReceived: string, packetsSent: string) => {
  return (parseInt(packetsReceived) * 100) / parseInt(packetsSent);
};

const fetchLatestIPData = async (model: string) => {
  const query =
    `
  SELECT DISTINCT ON (ip_address) 
    ip_address, 
    bucket AS latest_bucket, 
    ip_address_packets_sent, 
    ip_address_packets_received,
    ip_address_avg_avg_rtt
  FROM ` +
    model +
    `
  ORDER BY ip_address, bucket DESC;
`;

  const result = await db.query(query, { type: QueryTypes.SELECT });
  return result;
};

// Handle GET request to retrieve paginated nodes
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1; // Default to page 1 if not provided
    const limit = parseInt(searchParams.get("limit")) || 10; // Default limit to 10 if not provided
    const nodeProviderID = searchParams.get("node_provider_id");
    const offset = (page - 1) * limit;

    const [
      nodesResults,
      oneHourIpAddresses,
      twentyFourHourIpAddresses,
      thirtyDaysIpAddresses,
    ] = await Promise.all([
      Nodes.findAndCountAll({
        where: nodeProviderID ? { node_provider_id: nodeProviderID } : {},
        offset,
        limit,
        raw: true,
      }),
      fetchLatestIPData("one_hour_ip_addresses"),
      fetchLatestIPData("twentyfour_hours_ip_addresses"),
      fetchLatestIPData("thirty_days_ip_addresses"),
    ]);

    // Fetch paginated nodes from the database
    const { rows: nodes, count: total } = nodesResults;

    const nodesList = nodes.map((node: any) => {
      const oneHourIP: any = oneHourIpAddresses.find(
        (ip: any) => ip.ip_address === node.ip_address
      );

      const twentyFourHoursIP: any = twentyFourHourIpAddresses.find(
        (ip: any) => ip.ip_address === node.ip_address
      );
      const thirtyDaysIP: any = thirtyDaysIpAddresses.find(
        (ip: any) => ip.ip_address === node.ip_address
      );

      return {
        ...node,
        uptime_1h: oneHourIP
          ? calculateUptime(
              oneHourIP.ip_address_packets_received,
              oneHourIP.ip_address_packets_sent
            )
          : 0,
        uptime_24h: twentyFourHoursIP
          ? calculateUptime(
              twentyFourHoursIP.ip_address_packets_received,
              twentyFourHoursIP.ip_address_packets_sent
            )
          : 0,
        uptime_30d: thirtyDaysIP
          ? calculateUptime(
              thirtyDaysIP.ip_address_packets_received,
              thirtyDaysIP.ip_address_packets_sent
            )
          : 0,
        avg_rtt_30d: thirtyDaysIP ? thirtyDaysIP.ip_address_avg_avg_rtt : 0,
      };
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: nodesList,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
