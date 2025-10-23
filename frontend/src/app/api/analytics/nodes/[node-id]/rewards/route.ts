import { NextRequest, NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import db from "@/app/database/config/database";

interface MetricRow {
  day_utc: string;
  node_status: string;
  performance_multiplier: number;
  rewards_reduction: number;
  base_rewards_xdr: number;
  adjusted_rewards_xdr: number;
  num_blocks_proposed: number;
  num_blocks_failed: number;
  daily_failure_rate: number;
  subnet_assigned: string | null;
  dc_id: string;
  region: string;
}

/**
 * GET /api/analytics/nodes/[node-id]/rewards
 * 
 * Get reward metrics for a specific node
 * Query params:
 *   - days: number of days to look back (default: 30)
 *   - startDate: start date (YYYY-MM-DD)
 *   - endDate: end date (YYYY-MM-DD)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { "node-id": string } }
) {
  try {
    const nodeId = params["node-id"];
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter
    let dateFilter = "";
    if (startDate && endDate) {
      dateFilter = `AND day_utc BETWEEN '${startDate}' AND '${endDate}'`;
    } else {
      dateFilter = `AND day_utc >= CURRENT_DATE - INTERVAL '${days} days'`;
    }

    // Get detailed metrics
    const metrics = await db.query<MetricRow>(
      `
      SELECT 
        day_utc,
        node_status,
        performance_multiplier,
        rewards_reduction,
        base_rewards_xdr_permyriad / 10000.0 as base_rewards_xdr,
        adjusted_rewards_xdr_permyriad / 10000.0 as adjusted_rewards_xdr,
        num_blocks_proposed,
        num_blocks_failed,
        CASE 
          WHEN num_blocks_proposed > 0 
          THEN CAST(num_blocks_failed AS DECIMAL) / num_blocks_proposed 
          ELSE 0 
        END as daily_failure_rate,
        relative_fr,
        subnet_assigned,
        dc_id,
        region
      FROM node_reward_metrics
      WHERE node_id = :nodeId
        ${dateFilter}
      ORDER BY day_utc DESC
    `,
      {
        replacements: { nodeId },
        type: QueryTypes.SELECT,
      }
    );

    // Get summary statistics
    const summary = await db.query(
      `
      SELECT 
        COUNT(CASE WHEN node_status = 'Assigned' THEN 1 END) as days_assigned,
        COUNT(CASE WHEN node_status = 'Unassigned' THEN 1 END) as days_unassigned,
        AVG(performance_multiplier) as avg_reward_multiplier,
        SUM(num_blocks_proposed) as total_blocks_proposed,
        SUM(num_blocks_failed) as total_blocks_failed,
        AVG(CASE 
          WHEN num_blocks_proposed > 0 
          THEN CAST(num_blocks_failed AS DECIMAL) / num_blocks_proposed 
          ELSE 0 
        END) as avg_failure_rate,
        MAX(base_rewards_xdr_permyriad) / 10000.0 as base_monthly_rewards_xdr,
        SUM(adjusted_rewards_xdr_permyriad) / 10000.0 as total_rewards_xdr
      FROM node_reward_metrics
      WHERE node_id = :nodeId
        ${dateFilter}
    `,
      {
        replacements: { nodeId },
        type: QueryTypes.SELECT,
      }
    );

    return NextResponse.json({
      nodeId,
      metrics,
      summary: summary[0] || {},
      period: {
        startDate: metrics.length > 0 ? metrics.at(-1)?.day_utc : null,
        endDate: metrics.length > 0 ? metrics.at(0)?.day_utc : null,
        totalDays: metrics.length,
      },
    });
  } catch (error) {
    console.error("Error fetching node rewards:", error);
    return NextResponse.json(
      { error: "Failed to fetch node rewards" },
      { status: 500 }
    );
  }
}


