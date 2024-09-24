import { NextRequest, NextResponse } from "next/server";
import {
  Nodes,
  OneHourIpAddresses,
  PingResults,
  SevenDaysIpAddresses,
  ThirtyDaysIpAddresses,
  TwentyFourHoursIpAddresses,
} from "@/app/database/models";
import db from "@/app/database/config/database";
import { fn, col, Op } from "sequelize";

const calculateUptime = (packetsReceived: string, packetsSent: string) => {
  return (parseInt(packetsReceived) * 100) / parseInt(packetsSent);
};

const getUptimeDowntimeForDuration = async (model: any, ipAddress: string) => {
  const results = await model.findOne({
    attributes: [
      "ip_address",
      "bucket",
      "ip_address_packets_sent",
      "ip_address_packets_received",
    ],
    where: {
      ip_address: ipAddress,
    },
    order: [["bucket", "DESC"]],
    raw: true,
  });

  const uptime = calculateUptime(
    results.ip_address_packets_received,
    results.ip_address_packets_sent
  );

  const downtime = 100 - uptime;

  return {
    uptime,
    downtime,
  };
};

// Handle GET request to retrieve all nodes
export async function GET(
  req: NextRequest,
  { params }: { params: { "node-id": string } }
) {
  try {
    // return chart data points for duration
    // return uptime & downtime for duration
    const { searchParams } = new URL(req.url);
    const duration = parseInt(searchParams.get("duration")) || 7; // Default to 7 days
    // duration: 1h, 24h, 7d, 30d

    const nodeDetails = await Nodes.findOne({
      where: { node_id: params["node-id"] },
    });

    const IPAddress = nodeDetails.dataValues.ip_address;
    let uptime = 0,
      downtime = 0;

    switch (duration) {
      case 1: {
        const response = await getUptimeDowntimeForDuration(
          OneHourIpAddresses,
          IPAddress
        );

        uptime = response.uptime;
        downtime = response.downtime;
        break;
      }
      case 24: {
        const response = await getUptimeDowntimeForDuration(
          TwentyFourHoursIpAddresses,
          IPAddress
        );

        uptime = response.uptime;
        downtime = response.downtime;
        break;
      }
      case 30: {
        const response = await getUptimeDowntimeForDuration(
          ThirtyDaysIpAddresses,
          IPAddress
        );

        uptime = response.uptime;
        downtime = response.downtime;
        break;
      }
      default: {
        const { uptime: responseUptime, downtime: responseDowntime } =
          await getUptimeDowntimeForDuration(SevenDaysIpAddresses, IPAddress);

        uptime = responseUptime;
        downtime = responseDowntime;
        break;
      }
    }

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // last 7 days data points
    const avgRTTResults = await PingResults.findAll({
      attributes: [
        [fn("DATE_TRUNC", "hour", col("ping_at_datetime")), "hour"],
        [fn("AVG", col("avg_rtt")), "avg_rtt"],
      ],
      where: {
        ping_at_datetime: {
          [Op.gte]: sevenDaysAgo,
          [Op.lte]: now,
        },
      },
      group: [fn("DATE_TRUNC", "hour", col("ping_at_datetime"))],
      order: [[fn("DATE_TRUNC", "hour", col("ping_at_datetime")), "ASC"]],
    });

    return NextResponse.json({
      success: true,
      data: {
        uptime, // uptime for the duration
        downtime, // downtime for the duration
        avg_rtt_data_points: avgRTTResults,
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
