import { NextRequest, NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import db from "@/app/database/config/database";

/**
 * GET /api/analytics/providers/[provider-id]/nodes-performance
 * 
 * Get detailed node performance table for a provider
 * Query params:
 *   - startDate: start date (YYYY-MM-DD) - required
 *   - endDate: end date (YYYY-MM-DD) - required
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 50)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { "provider-id": string } }
) {
  try {
    const providerId = params["provider-id"];
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    // Get node performance data
    const performance = await db.query(
      `
      SELECT 
        day_utc,
        node_id,
        node_status,
        num_blocks_proposed,
        num_blocks_failed,
        CASE 
          WHEN num_blocks_proposed > 0 
          THEN CAST(num_blocks_failed AS DECIMAL) / num_blocks_proposed 
          ELSE 0 
        END as daily_failure_rate,
        relative_fr,
        subnet_assigned,
        base_rewards_xdr_permyriad / 10000.0 as base_rewards_xdr,
        adjusted_rewards_xdr_permyriad / 10000.0 as adjusted_rewards_xdr,
        rewards_reduction
      FROM node_reward_metrics
      WHERE node_provider_id = :providerId
        AND day_utc BETWEEN :startDate AND :endDate
      ORDER BY day_utc DESC, node_id
      LIMIT :limit OFFSET :offset
    `,
      {
        replacements: { providerId, startDate, endDate, limit, offset },
        type: QueryTypes.SELECT,
      }
    );

    // Get total count for pagination
    const countResult = await db.query(
      `
      SELECT COUNT(*) as total
      FROM node_reward_metrics
      WHERE node_provider_id = :providerId
        AND day_utc BETWEEN :startDate AND :endDate
    `,
      {
        replacements: { providerId, startDate, endDate },
        type: QueryTypes.SELECT,
      }
    );

    const total = (countResult[0] as any).total;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      providerId,
      performance,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      period: {
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error("Error fetching nodes performance:", error);
    return NextResponse.json(
      { error: "Failed to fetch nodes performance" },
      { status: 500 }
    );
  }
}


