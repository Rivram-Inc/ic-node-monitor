import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from "next";

const PINGDOM_API_KEY =
  "7S-LOihA3ooDAjkU0HUVk84yPiDQTnYDAiqAAE1EFz0mTZ25oq8CVXOZtiVeQvDMQZ4L8W8";
const PINGDOM_API_URL = "https://api.pingdom.com/api/3.1";

async function handleRequest(req: NextRequest, slug: string[]) {
  const { method, body, nextUrl } = req;
  const endpoint = slug.join("/");
  const queryString = nextUrl.search; // Extract query string from the request URL
  const targetUrl = `${PINGDOM_API_URL}/${endpoint}${queryString}`;

  try {
    const response = await axios({
      method,
      url: targetUrl,
      headers: {
        Authorization: `Bearer ${PINGDOM_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: body,
    });

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error: any) {
    if (error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    } else {
      console.error(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(req, params.slug);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(req, params.slug);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(req, params.slug);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(req, params.slug);
}
