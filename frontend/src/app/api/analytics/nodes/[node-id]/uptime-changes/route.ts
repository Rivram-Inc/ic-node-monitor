import { NextRequest, NextResponse } from "next/server";
import db from "@/app/database/config/database";
import { Nodes } from "@/app/database/models";
import { QueryTypes } from "sequelize";

export async function GET(
  req: NextRequest,
  { params }: { params: { "node-id": string } }
) {
  try {
    // Fetch node details from the database
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

    // Query to fetch status changes and durations
    const query = `
      WITH status_changes AS (
        SELECT
          ip_address,
          ping_at_datetime,
          CASE
            WHEN packet_loss = 0 THEN 'up'
            ELSE 'down'
          END AS status,
          LAG(CASE
                WHEN packet_loss = 0 THEN 'up'
                ELSE 'down'
              END) OVER (PARTITION BY ip_address ORDER BY ping_at_datetime) AS prev_status
        FROM
          ping_results
        WHERE
          ip_address = $1 -- Use IP address from node details
          AND ping_at_datetime >= NOW() - INTERVAL '24 h' -- Process last 24h
      ),
      status_durations AS (
        SELECT
          ip_address,
          ping_at_datetime,
          status,
          prev_status,
          CASE
            WHEN status != prev_status OR prev_status IS NULL THEN ping_at_datetime
          END AS status_start_time
        FROM
          status_changes
      ),
      final_durations AS (
        SELECT
          ip_address,
          status,
          status_start_time AS "from",
          LEAD(status_start_time) OVER (PARTITION BY ip_address ORDER BY ping_at_datetime) AS "to"
        FROM
          status_durations
        WHERE
          status_start_time IS NOT NULL
      )
      SELECT
        ip_address,
        status,
        "from",
        "to",
        "to" - "from" AS duration
      FROM
        final_durations
      WHERE
        "to" IS NOT NULL
      ORDER BY
        ip_address,
        "from";
    `;

    // Execute the query
    const result = await db.query(query, {
      bind: [IPAddress],
      type: QueryTypes.SELECT,
    });

    // Return the result
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
