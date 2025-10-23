import { NextRequest, NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import db from "@/app/database/config/database";

/**
 * GET /api/analytics/providers/[provider-id]/rewards
 * 
 * Get reward summary for a specific node provider
 * Query params:
 *   - days: number of days to look back (default: 30)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { "provider-id": string } }
) {
  try {
    const providerId = params["provider-id"];
    const searchParams = request.nextUrl.searchParams;
    const days = Number.parseInt(searchParams.get("days") || "30");

    // Get latest rewarding period data
    const latestPeriod = await db.query(
      `
      SELECT 
        p.day_utc as date,
        c.xdr_to_icp as conversion_rate,
        c.icp_to_usd as icp_price_usd,
        p.expected_rewards_xdr_permyriad / 10000.0 as expected_rewards_xdr,
        (p.expected_rewards_xdr_permyriad / 10000.0) * COALESCE(c.xdr_to_icp, 0) as expected_rewards_icp,
        p.actual_rewards_xdr_permyriad / 10000.0 as last_rewards_xdr,
        (p.actual_rewards_xdr_permyriad / 10000.0) * COALESCE(c.xdr_to_icp, 0) as last_rewards_icp,
        p.total_nodes,
        p.assigned_nodes,
        p.unassigned_nodes,
        p.total_blocks_proposed,
        p.total_blocks_failed,
        p.total_failure_rate
      FROM node_provider_daily_summary p
      LEFT JOIN xdr_icp_conversion_rates c ON p.day_utc = c.day_utc
      WHERE p.node_provider_id = :providerId
      ORDER BY p.day_utc DESC
      LIMIT 1
    `,
      {
        replacements: { providerId },
        type: QueryTypes.SELECT,
      }
    );

    // Get historical data
    const historical = await db.query(
      `
      SELECT 
        p.day_utc,
        p.total_nodes,
        p.assigned_nodes,
        p.expected_rewards_xdr_permyriad / 10000.0 as expected_rewards_xdr,
        p.actual_rewards_xdr_permyriad / 10000.0 as actual_rewards_xdr,
        p.total_reduction_xdr_permyriad / 10000.0 as reduction_xdr,
        p.total_blocks_proposed,
        p.total_blocks_failed,
        p.total_failure_rate,
        (p.actual_rewards_xdr_permyriad / 10000.0) * COALESCE(c.xdr_to_icp, 0) as actual_rewards_icp
      FROM node_provider_daily_summary p
      LEFT JOIN xdr_icp_conversion_rates c ON p.day_utc = c.day_utc
      WHERE p.node_provider_id = :providerId
        AND p.day_utc >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY p.day_utc DESC
    `,
      {
        replacements: { providerId },
        type: QueryTypes.SELECT,
      }
    );

    // Get aggregated statistics
    const aggregated = await db.query(
      `
      SELECT 
        COUNT(DISTINCT day_utc) as days_with_data,
        AVG(total_nodes) as avg_total_nodes,
        AVG(assigned_nodes) as avg_assigned_nodes,
        SUM(total_blocks_proposed) as total_blocks_proposed,
        SUM(total_blocks_failed) as total_blocks_failed,
        AVG(total_failure_rate) as avg_failure_rate,
        SUM(actual_rewards_xdr_permyriad) / 10000.0 as total_rewards_xdr
      FROM node_provider_daily_summary
      WHERE node_provider_id = :providerId
        AND day_utc >= CURRENT_DATE - INTERVAL '${days} days'
    `,
      {
        replacements: { providerId },
        type: QueryTypes.SELECT,
      }
    );

    return NextResponse.json({
      providerId,
      latestPeriod: latestPeriod[0] || null,
      historical,
      aggregated: aggregated[0] || {},
    });
  } catch (error) {
    console.error("Error fetching provider rewards:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider rewards" },
      { status: 500 }
    );
  }
}


