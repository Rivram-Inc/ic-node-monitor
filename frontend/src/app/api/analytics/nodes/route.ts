import { NextRequest, NextResponse } from "next/server";
// import { sequelize } from "@/lib/sequelize";
// import { Nodes } from "@/app/database/models";
import { Nodes } from "@/app/database/models";

// Handle GET request to retrieve paginated nodes
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1; // Default to page 1 if not provided
    const limit = parseInt(searchParams.get("limit")) || 10; // Default limit to 10 if not provided
    const nodeProviderID = searchParams.get("node_provider_id");
    const offset = (page - 1) * limit;

    // Fetch paginated nodes from the database
    const { rows: nodes, count: total } = await Nodes.findAndCountAll({
      where: nodeProviderID ? { node_provider_id: nodeProviderID } : {},
      offset,
      limit,
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

// // Example for POST request to create a new node
// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const newNode = await Nodes.create(body);
//     return NextResponse.json({ success: true, data: newNode }, { status: 201 });
//   } catch (error) {
//     console.error("Error creating node:", error);
//     return NextResponse.json(
//       { success: false, message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
