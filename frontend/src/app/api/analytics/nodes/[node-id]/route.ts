import { NextRequest, NextResponse } from "next/server";
// import { sequelize } from "@/lib/sequelize";
// import { Nodes } from "@/app/database/models";
import {
  DataCenters,
  Nodes,
  OneHourIpAddresses,
  PingResults,
  ThirtyDaysIpAddresses,
  TwentyFourHoursIpAddresses,
} from "@/app/database/models";
import db from "@/app/database/config/database";

const PROBES_COORDINATES = {
  PROBE_TORONTO: {
    lat: 43.65107,
    long: -79.347015,
  },
  PROBE_SINGAPORE: {
    lat: 1.3521,
    long: 103.8198,
  },
  PROBE_SPAIN: {
    lat: 40.416775,
    long: -3.70379,
  },
};

const getLatestPingResultsForNode = async (ipAddress: string) => {
  const latestPings = await db.query(
    `
    SELECT pr.*
    FROM ping_results pr
    INNER JOIN (
      SELECT probe_name, MAX(ping_at_datetime) AS latest_ping_at
      FROM ping_results
      WHERE ip_address = :ipAddress
      GROUP BY probe_name
    ) AS latest
    ON pr.probe_name = latest.probe_name AND pr.ping_at_datetime = latest.latest_ping_at
    WHERE pr.ip_address = :ipAddress
  `,
    {
      replacements: { ipAddress },
      model: PingResults,
      mapToModel: true, // This will map results to the PingResults model
    }
  );

  return latestPings;
};

// Handle GET request to retrieve all nodes
export async function GET(
  req: NextRequest,
  { params }: { params: { "node-id": string } }
) {
  try {
    const nodeDetails = await Nodes.findOne({
      where: { node_id: params["node-id"] },
    });

    if (!nodeDetails) {
      return NextResponse.json(
        { success: false, message: "Node not found" },
        { status: 404 }
      );
    }

    const IPAddress = nodeDetails.dataValues.ip_address;

    // fetch average response time
    const [
      oneHourMinMaxResponseTime,
      twentyfourHoursMinMaxResponseTime,
      thirtyDaysMinMaxResponseTime,
      latestPingsPerProbe,
    ] = await Promise.all([
      OneHourIpAddresses.findOne({
        where: { ip_address: IPAddress },
        attributes: ["ip_address_min_avg_rtt", "ip_address_max_avg_rtt"],
        limit: 1,
        order: [["bucket", "DESC"]],
      }),
      TwentyFourHoursIpAddresses.findOne({
        where: { ip_address: IPAddress },
        attributes: ["ip_address_min_avg_rtt", "ip_address_max_avg_rtt"],
        limit: 1,
        order: [["bucket", "DESC"]],
      }),
      ThirtyDaysIpAddresses.findOne({
        where: { ip_address: IPAddress },
        attributes: ["ip_address_min_avg_rtt", "ip_address_max_avg_rtt"],
        limit: 1,
        order: [["bucket", "DESC"]],
      }),
      getLatestPingResultsForNode(IPAddress),
    ]);

    // get probe coordinates
    const probes = latestPingsPerProbe.map((ping) => {
      const probeName = ping.dataValues.probe_name;
      const probeCoordinates = PROBES_COORDINATES[probeName];
      return {
        probe_name: probeName,
        lat: probeCoordinates.lat,
        long: probeCoordinates.long,
        avg_rtt: ping.dataValues.avg_rtt,
      };
    });

    // from node details -> datacenter id -> datacenter lat/long from datacenter table
    const datacenterDetails = await DataCenters.findOne({
      where: { dc_key: nodeDetails.dataValues.dc_id },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...nodeDetails.dataValues,
        datacenter: datacenterDetails,
        probes,
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
