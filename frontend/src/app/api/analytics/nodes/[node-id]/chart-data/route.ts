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

const fetchAvgRTTInDuration = async (ipAddress: string, duration: string) => {
  return db.query(
    `
    SELECT *
    FROM one_hour_ip_addresses
    WHERE bucket > NOW() - INTERVAL :duration AND ip_address = :ipAddress
    ORDER BY bucket ASC
  `,
    { replacements: { ipAddress, duration } }
  );
};

const getDurationString = (duration: number) => {
  // 1h, 7d, 24h, 30d
  switch (duration) {
    case 1:
      return "1 hour";
    case 7:
      return "7 days";
    case 24:
      return "24 hours";
    case 30:
      return "30 days";
    default:
      return "7 days";
  }
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

    const IPAddressesModel = {
      1: OneHourIpAddresses,
      7: SevenDaysIpAddresses,
      24: TwentyFourHoursIpAddresses,
      30: ThirtyDaysIpAddresses,
    };

    // duration string for hours & days
    const durationString = getDurationString(duration);

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const [uptimeDowntimeResponse, avgRTTResults] = await Promise.all([
      getUptimeDowntimeForDuration(
        IPAddressesModel[duration] || SevenDaysIpAddresses,
        IPAddress
      ),
      fetchAvgRTTInDuration(IPAddress, durationString),
    ]);

    const avgRTTGroupByProbeName = avgRTTResults[0].reduce(
      (acc: any, curr: any) => {
        if (!acc[curr.probe_name]) {
          acc[curr.probe_name] = [];
        }
        acc[curr.probe_name].push(curr);
        return acc;
      },
      {}
    );

    const uptime = uptimeDowntimeResponse.uptime || 0;
    const downtime = uptimeDowntimeResponse.downtime || 0;

    return NextResponse.json({
      success: true,
      data: {
        uptime, // uptime for the duration
        downtime, // downtime for the duration
        avg_rtt_data_points: avgRTTGroupByProbeName,
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
