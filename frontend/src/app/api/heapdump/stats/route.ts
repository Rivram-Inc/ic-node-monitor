// src/app/api/heapdump/stats/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const mem = process.memoryUsage();

  return NextResponse.json({
    heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
    rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
    uptime: `${Math.round(process.uptime() / 60)} minutes`,
    pid: process.pid,
  });
}
