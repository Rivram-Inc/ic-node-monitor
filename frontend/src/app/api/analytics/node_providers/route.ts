import { NextRequest, NextResponse } from "next/server";
import { ThirtyDaysNodeProviders } from "@/app/database/models";
import db from "@/app/database/config/database";
import { QueryTypes, fn, col } from "sequelize";

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

    const [totalCount, nodeProviderResults] = await Promise.all([
      ThirtyDaysNodeProviders.count({
        distinct: true,
        col: "node_provider_id",
      }),
      ThirtyDaysNodeProviders.findAll({
        attributes: [
          "node_provider_id",
          "node_provider_name",
          [fn("MAX", col("bucket")), "latest_bucket"],
          [
            fn("SUM", col("node_provider_total_packets_sent")),
            "node_provider_total_packets_sent",
          ],
          [
            fn("SUM", col("node_provider_total_packets_received")),
            "node_provider_total_packets_received",
          ],
        ],
        group: ["node_provider_id", "node_provider_name"],
        order: [["latest_bucket", "DESC"]],
        offset: offset,
        limit: limit,
        raw: true,
      }),
    ]);

    const nodeProviders = nodeProviderResults.map((nodeProvider: any) => {
      return {
        ...nodeProvider,
        uptime_30d: calculateUptime(
          nodeProvider.node_provider_total_packets_received,
          nodeProvider.node_provider_total_packets_sent
        ),
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
