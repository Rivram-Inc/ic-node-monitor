import { NextRequest, NextResponse } from "next/server";
import { QueryTypes } from "sequelize";
import db from "@/app/database/config/database";

/**
 * GET /api/analytics/conversion-rates
 * 
 * Get XDR to ICP conversion rates
 * Query params:
 *   - days: number of days to look back (default: 30)
 *   - date: specific date (YYYY-MM-DD) - if provided, returns single day
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = Number.parseInt(searchParams.get("days") || "30");
    const date = searchParams.get("date");

    if (date) {
      // Get specific date
      const rate = await db.query(
        `
        SELECT 
          day_utc,
          xdr_to_usd,
          icp_to_usd,
          xdr_to_icp,
          source,
          created_at
        FROM xdr_icp_conversion_rates
        WHERE day_utc = :date
      `,
        {
          replacements: { date },
          type: QueryTypes.SELECT,
        }
      );

      return NextResponse.json({
        rate: rate[0] || null,
      });
    } else {
      // Get historical rates
      const rates = await db.query(
        `
        SELECT 
          day_utc,
          xdr_to_usd,
          icp_to_usd,
          xdr_to_icp,
          source
        FROM xdr_icp_conversion_rates
        WHERE day_utc >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY day_utc DESC
      `,
        {
          type: QueryTypes.SELECT,
        }
      );

      // Get latest rate
      const latest = rates.length > 0 ? rates[0] : null;

      return NextResponse.json({
        latest,
        rates,
        count: rates.length,
      });
    }
  } catch (error) {
    console.error("Error fetching conversion rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversion rates" },
      { status: 500 }
    );
  }
}


