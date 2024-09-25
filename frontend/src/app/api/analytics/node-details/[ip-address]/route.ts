import { NextRequest, NextResponse } from "next/server";
// import { sequelize } from "@/lib/sequelize";
// import { Nodes } from "@/app/database/models";
import { PingResults } from "@/app/database/models";

// Handle GET request to retrieve paginated nodes by IP address
export async function GET(
  req: NextRequest,
  { params }: { params: { "ip-address": string } }
) {
  try {
    // Extract query parameters for pagination
    const { searchParams } = new URL(req.url);
    const IPAddress = params["ip-address"];
    const page = parseInt(searchParams.get("page")) || 1; // Default to page 1 if not provided
    const limit = parseInt(searchParams.get("limit")) || 10; // Default limit to 10 if not provided
    const offset = (page - 1) * limit;

    // Fetch paginated nodes from the database based on IP address
    const { rows: nodes, count: total } = await PingResults.findAndCountAll({
      where: { ip_address: IPAddress },
      offset,
      limit,
      order: [["ping_at_datetime", "DESC"]],
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: nodes,
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
