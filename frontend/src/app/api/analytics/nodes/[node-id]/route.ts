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
import { getGeoIpDetails } from "@/utils/geo-ip";
import { QueryTypes } from "sequelize";

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
  // Step 1: Fetch the latest ping_at_datetime for each probe_name
  const latestPingsAt: {
    probe_name: string;
    latest_ping_at: string;
  }[] = await db.query(
    `
    SELECT probe_name, MAX(ping_at_datetime) AS latest_ping_at
    FROM ping_results
    WHERE ip_address = :ipAddress
    GROUP BY probe_name
    `,
    {
      replacements: { ipAddress },
      type: QueryTypes.SELECT,
    }
  );

  // Step 2: Fetch full rows based on probe_name and latest_ping_at
  const latestPings = await Promise.all(
    latestPingsAt.map(({ probe_name, latest_ping_at }) => {
      return db.query(
        `
        SELECT *
        FROM ping_results
        WHERE ip_address = :ipAddress
        AND probe_name = :probeName
        AND ping_at_datetime <= :latestPingAt
        ORDER BY ping_at_datetime DESC
        LIMIT 1
        `,
        {
          replacements: {
            ipAddress,
            probeName: probe_name,
            latestPingAt: latest_ping_at,
          },
          model: PingResults,
          mapToModel: true,
        }
      );
    })
  );

  return latestPings.flat()?.filter((ping) => ping.dataValues);
};

const getLatestBucket = async (model: any, ipAddress: string) => {
  const latestBucket = await model.findOne({
    where: { ip_address: ipAddress },
    attributes: ["bucket"],
    order: [["bucket", "DESC"]],
    limit: 1,
  });

  return latestBucket?.bucket;
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

    const [
      oneHourLatestBucket,
      twentyfourHoursLatestBucket,
      thirtyDaysLatestBucket,
    ] = await Promise.all([
      getLatestBucket(OneHourIpAddresses, IPAddress),
      getLatestBucket(TwentyFourHoursIpAddresses, IPAddress),
      getLatestBucket(ThirtyDaysIpAddresses, IPAddress),
    ]);

    // fetch average response time
    const [
      geoIpDetails,
      oneHourMinMaxResponseTime,
      twentyfourHoursMinMaxResponseTime,
      thirtyDaysMinMaxResponseTime,
      latestPingsPerProbe,
    ] = await Promise.all([
      getGeoIpDetails(IPAddress),
      OneHourIpAddresses.findOne({
        where: { ip_address: IPAddress, bucket: oneHourLatestBucket },
        attributes: ["ip_address_min_avg_rtt", "ip_address_max_avg_rtt"],
      }),
      TwentyFourHoursIpAddresses.findOne({
        where: { ip_address: IPAddress, bucket: twentyfourHoursLatestBucket },
        attributes: ["ip_address_min_avg_rtt", "ip_address_max_avg_rtt"],
      }),
      ThirtyDaysIpAddresses.findOne({
        where: { ip_address: IPAddress, bucket: thirtyDaysLatestBucket },
        attributes: ["ip_address_min_avg_rtt", "ip_address_max_avg_rtt"],
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
        geo_ip_details: geoIpDetails,
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
