import { NextResponse } from "next/server";
import heapdump from "heapdump";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Use a dedicated directory you control
const HEAPDUMP_DIR = path.join(process.cwd(), "heapdumps");

// Create directory if it doesn't exist
if (!fs.existsSync(HEAPDUMP_DIR)) {
  fs.mkdirSync(HEAPDUMP_DIR, { recursive: true });
}

export async function GET() {
  // Generate truly unique filename
  const timestamp = Date.now();
  const filename = path.join(
    HEAPDUMP_DIR,
    `heapdump-${timestamp}-${process.pid}.heapsnapshot`
  );

  try {
    // Take heap dump with timeout protection
    const dumpGenerated = await new Promise((resolve) => {
      // 30-second timeout
      const timeout = setTimeout(() => {
        resolve(false);
      }, 30000);

      heapdump.writeSnapshot(filename, (err) => {
        clearTimeout(timeout);
        if (err) {
          console.error("Heapdump error:", err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

    // Verify file was actually created
    const fileExists = fs.existsSync(filename);
    const fileSize = fileExists ? fs.statSync(filename).size : 0;

    if (!dumpGenerated || !fileExists) {
      throw new Error("Heapdump file was not generated");
    }

    return NextResponse.json({
      success: true,
      filename,
      fileSize,
      timestamp,
      pid: process.pid,
    });
  } catch (error) {
    // Clean up if partial file was created
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp,
        pid: process.pid,
      },
      { status: 500 }
    );
  }
}
