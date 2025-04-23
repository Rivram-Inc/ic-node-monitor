import nodesByNPList from "../../../../../nodes_by_np.json";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const PINGDOM_API_KEY =
  "7S-LOihA3ooDAjkU0HUVk84yPiDQTnYDAiqAAE1EFz0mTZ25oq8CVXOZtiVeQvDMQZ4L8W8";
const PINGDOM_API_URL = "https://api.pingdom.com/api/3.1";

type Resolution = 1 | 5 | 15 | 30 | 60;

type CheckType = {
  name: string;
  host: string;
  type: string;
  ipv6: boolean;
  resolution: Resolution;
};

const createCheckCall = async (check: CheckType) => {
  console.log("CHECK: ", check);
  const response = await axios({
    method: "POST",
    url: `${PINGDOM_API_URL}/checks`,
    headers: {
      Authorization: `Bearer ${PINGDOM_API_KEY}`,
      "Content-Type": "application/json",
    },
    data: check,
  });

  return response.data;
};

export async function POST(req: NextRequest) {
  const response = await axios({
    method: "GET",
    url: `${PINGDOM_API_URL}/checks`,
    headers: {
      Authorization: `Bearer ${PINGDOM_API_KEY}`,
      "Content-Type": "application/json",
    },
    data: null,
  });

  const checks = response.data.checks;

  const checksToBeCreated = nodesByNPList.filter((node: any) => {
    const found = checks.find((check: any) => {
      return node.ip_address === check.hostname;
    });

    return !found;
  });

  const createdChecks = await Promise.all(
    checksToBeCreated.map((check: any) => {
      return createCheckCall({
        name: check.node_provider_name,
        host: check.ip_address,
        type: "ping",
        ipv6: true,
        resolution: 1,
      });
    })
  );

  console.log("Created Checks: ", createdChecks);
  return NextResponse.json(
    { message: "Bulk create checks successful" },
    { status: 200 }
  );
}
