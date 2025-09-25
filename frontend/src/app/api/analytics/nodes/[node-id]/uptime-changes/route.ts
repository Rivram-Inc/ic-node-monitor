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
              END) OVER (PARTITION BY ip_address ORDER BY ping_at_datetime) AS prev_status,
          ROW_NUMBER() OVER (PARTITION BY ip_address ORDER BY ping_at_datetime) AS row_num
        FROM
          ping_results
        WHERE
          ip_address = $1 -- Use IP address from node details
          AND ping_at_datetime >= NOW() - INTERVAL '24 h' -- Process last 24h
      ),
      status_transitions AS (
        SELECT
          ip_address,
          ping_at_datetime,
          status,
          prev_status,
          row_num,
          CASE
            WHEN status != prev_status OR prev_status IS NULL THEN ping_at_datetime
          END AS transition_time
        FROM
          status_changes
      ),
      status_periods AS (
        SELECT
          ip_address,
          status,
          transition_time AS "from",
          LEAD(transition_time) OVER (PARTITION BY ip_address ORDER BY transition_time) AS "to"
        FROM
          status_transitions
        WHERE
          transition_time IS NOT NULL
      ),
      completed_periods AS (
        SELECT
          ip_address,
          status,
          "from",
          "to",
          "to" - "from" AS duration
        FROM
          status_periods
        WHERE
          "to" IS NOT NULL
      ),
      current_period AS (
        SELECT
          ip_address,
          status,
          "from",
          NOW() AS "to",
          NOW() - "from" AS duration
        FROM
          status_periods
        WHERE
          "to" IS NULL
      )
      SELECT
        ip_address,
        status,
        "from",
        "to",
        duration
      FROM
        completed_periods
      UNION ALL
      SELECT
        ip_address,
        status,
        "from",
        "to",
        duration
      FROM
        current_period
      ORDER BY
        "from" DESC;
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
