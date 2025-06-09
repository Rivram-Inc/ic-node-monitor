// src/app/api/heapdump/route.ts
import { NextResponse } from "next/server";

const heapdump = require("heapdump");
const path = require("path");
const fs = require("fs");

export async function POST() {
  const dumpDir = path.join(process.cwd(), "heapdumps");

  if (!fs.existsSync(dumpDir)) {
    fs.mkdirSync(dumpDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = path.join(dumpDir, `heap-${timestamp}.heapsnapshot`);

  console.log(`Creating heap dump...`);

  return new Promise<NextResponse>((resolve) => {
    heapdump.writeSnapshot(filename, (err: any, actualFilename: string) => {
      if (err) {
        console.error("Heap dump error:", err);
        resolve(NextResponse.json({ error: "Failed" }, { status: 500 }));
      } else {
        const stats = fs.statSync(actualFilename);
        const sizeMB = Math.round(stats.size / 1024 / 1024);
        console.log(`Heap dump created: ${sizeMB}MB`);

        resolve(
          NextResponse.json({
            success: true,
            size: `${sizeMB}MB`,
          })
        );
      }
    });
  });
}
