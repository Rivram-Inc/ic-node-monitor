import { NextRequest, NextResponse } from "next/server";
import { Nodes } from "@/app/database/models";
import db from "@/app/database/config/database";
import { QueryTypes } from "sequelize";

const calculateUptime = (packetsReceived: string, packetsSent: string) => {
  return (parseInt(packetsReceived) * 100) / parseInt(packetsSent);
};

// Handle GET request to retrieve paginated nodes
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1; // Default to page 1 if not provided
    const limit = parseInt(searchParams.get("limit")) || 10; // Default limit to 10 if not provided
    const offset = (page - 1) * limit;

    // First, get unique node providers from the Nodes table (always up-to-date)
    const [totalCount, nodeProviderResults] = await Promise.all([
      Nodes.count({
        distinct: true,
        col: "node_provider_id",
      }),
      db.query(
        `
        SELECT 
          n.node_provider_id,
          n.node_provider_name,
          COALESCE(tdnp.latest_bucket, NULL) as latest_bucket,
          COALESCE(tdnp.node_provider_total_packets_sent, 0) as node_provider_total_packets_sent,
          COALESCE(tdnp.node_provider_total_packets_received, 0) as node_provider_total_packets_received
        FROM (
          SELECT DISTINCT 
            node_provider_id, 
            node_provider_name
          FROM nodes
          ORDER BY node_provider_id
          LIMIT :limit OFFSET :offset
        ) n
        LEFT JOIN (
          SELECT 
            node_provider_id,
            MAX(bucket) as latest_bucket,
            SUM(node_provider_total_packets_sent) as node_provider_total_packets_sent,
            SUM(node_provider_total_packets_received) as node_provider_total_packets_received
          FROM thirty_days_node_providers
          GROUP BY node_provider_id
        ) tdnp ON n.node_provider_id = tdnp.node_provider_id
        ORDER BY tdnp.latest_bucket DESC NULLS LAST, n.node_provider_id
      `,
        {
          replacements: { limit, offset },
          type: QueryTypes.SELECT,
        }
      ),
    ]);

    const nodeProviders = nodeProviderResults.map((nodeProvider: any) => {
      const uptime =
        nodeProvider.node_provider_total_packets_sent > 0
          ? calculateUptime(
              nodeProvider.node_provider_total_packets_received,
              nodeProvider.node_provider_total_packets_sent
            )
          : 0;

      return {
        node_provider_id: nodeProvider.node_provider_id,
        node_provider_name: nodeProvider.node_provider_name,
        latest_bucket: nodeProvider.latest_bucket,
        node_provider_total_packets_sent:
          nodeProvider.node_provider_total_packets_sent,
        node_provider_total_packets_received:
          nodeProvider.node_provider_total_packets_received,
        uptime_30d: uptime,
      };
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: nodeProviders,
      pagination: {
        totalItems: totalCount,
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
