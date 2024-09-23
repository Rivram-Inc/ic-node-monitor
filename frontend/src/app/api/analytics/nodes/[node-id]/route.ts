import { NextRequest, NextResponse } from "next/server";
// import { sequelize } from "@/lib/sequelize";
// import { Nodes } from "@/app/database/models";
import {
  Nodes,
  OneHourIpAddresses,
  ThirtyDaysIpAddresses,
  TwentyFourHoursIpAddresses,
} from "@/app/database/models";

// Handle GET request to retrieve all nodes
export async function GET(
  req: NextRequest,
  { params }: { params: { "node-id": string } }
) {
  try {
    const nodeDetails = await Nodes.findOne({
      where: { node_id: params["node-id"] },
    });

    const IPAddress = nodeDetails.dataValues.ip_address;

    // fetch average response time
    const oneHourMinMaxResponseTime = await OneHourIpAddresses.findOne({
      where: { ip_address: IPAddress },
      attributes: ["ip_address_min_avg_rtt", "ip_address_max_avg_rtt"],
      limit: 1,
      order: [["bucket", "DESC"]],
    });

    const twentyfourHoursMinMaxResponseTime =
      await TwentyFourHoursIpAddresses.findOne({
        where: { ip_address: IPAddress },
        attributes: ["ip_address_min_avg_rtt", "ip_address_max_avg_rtt"],
        limit: 1,
        order: [["bucket", "DESC"]],
      });

    const thirtyDaysMinMaxResponseTime = await ThirtyDaysIpAddresses.findOne({
      where: { ip_address: IPAddress },
      attributes: ["ip_address_min_avg_rtt", "ip_address_max_avg_rtt"],
      limit: 1,
      order: [["bucket", "DESC"]],
    });

    return NextResponse.json({
      success: true,
      data: {
        ...nodeDetails.dataValues,
        one_hour_min_avg_rtt:
          oneHourMinMaxResponseTime.dataValues.ip_address_min_avg_rtt,
        twentyfour_hours_min_avg_rtt:
          twentyfourHoursMinMaxResponseTime.dataValues.ip_address_min_avg_rtt,
        thirty_days_min_avg_rtt:
          thirtyDaysMinMaxResponseTime.dataValues.ip_address_min_avg_rtt,
        one_hour_max_avg_rtt:
          oneHourMinMaxResponseTime.dataValues.ip_address_max_avg_rtt,
        twentyfour_hours_max_avg_rtt:
          twentyfourHoursMinMaxResponseTime.dataValues.ip_address_max_avg_rtt,
        thirty_days_max_avg_rtt:
          thirtyDaysMinMaxResponseTime.dataValues.ip_address_max_avg_rtt,
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
