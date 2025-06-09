// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

let requestCount = 0;

export function middleware(request: NextRequest) {
  // Only track API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    requestCount++;

    // Log request start
    console.log(
      `[${requestCount}] API ${request.method} ${
        request.nextUrl.pathname
      } - Start Memory: ${Math.round(startMemory.heapUsed / 1024 / 1024)}MB`
    );

    // Create response and add memory tracking
    const response = NextResponse.next();

    // Add a header to track this request (we'll use this in a global handler)
    response.headers.set(
      "x-memory-track-start",
      startMemory.heapUsed.toString()
    );
    response.headers.set("x-memory-track-time", startTime.toString());
    response.headers.set("x-memory-track-count", requestCount.toString());

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
