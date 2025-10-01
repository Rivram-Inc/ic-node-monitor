import { NextRequest, NextResponse } from "next/server";
import { NodeProviders } from "@/app/database/models";

// Handle GET request to retrieve node providers
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1; // Default to page 1 if not provided
    const limit = parseInt(searchParams.get("limit")) || 10; // Default limit to 10 if not provided
    const offset = (page - 1) * limit;

    // Get total count and node providers using Sequelize model
    const [totalCount, nodeProviders] = await Promise.all([
      NodeProviders.count(),
      NodeProviders.findAll({
        attributes: [
          'principal_id',
          'display_name',
          'location_count',
          'logo_url',
          'total_node_allowance',
          'total_nodes',
          'total_rewardable_nodes',
          'total_subnets',
          'total_unassigned_nodes',
          'website',
          'locations'
        ],
        order: [
          ['total_nodes', 'DESC'],
          ['display_name', 'ASC']
        ],
        limit,
        offset,
      }),
    ]);

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
    console.error("Error fetching node providers:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
