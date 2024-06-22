import axios from "axios";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

const PINGDOM_API_KEY =
  "7S-LOihA3ooDAjkU0HUVk84yPiDQTnYDAiqAAE1EFz0mTZ25oq8CVXOZtiVeQvDMQZ4L8W8";
const PINGDOM_API_URL = "https://api.pingdom.com/api/3.1";

const probes = [];

const updateProbesList = async () => {
  const response = await axios({
    method: "GET",
    url: `${PINGDOM_API_URL}/probes`,
    headers: {
      Authorization: `Bearer ${PINGDOM_API_KEY}`,
      "Content-Type": "application/json",
    },
    data: null,
  });

  const probesList = response.data.probes;

  for (const probe of probesList) {
    probes.push({
      id: probe.id,
      name: probe.name,
      country: probe.country,
      countryiso: probe.countryiso,
      city: probe.city,
    });
  }
};

const getRelativeTime = (timestamp) => {
  // Current time
  const currentTime = moment().unix();

  // Calculate the difference in seconds
  const timeDifference = currentTime - timestamp;

  // Create a moment object with the difference
  const relativeTime = moment.duration(timeDifference, "seconds");

  // Format the output
  let relativeTimeString;

  if (timeDifference < 60) {
    relativeTimeString = "<1 min ago";
  } else if (timeDifference < 120) {
    relativeTimeString = "<2 min ago";
  } else {
    relativeTimeString = relativeTime.humanize() + " ago";
  }

  return relativeTimeString;
};

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: string;
  }
) {
  const checkID = params["check-id"];

  // get check details
  const checkResponse = await axios({
    method: "GET",
    url: `${PINGDOM_API_URL}/checks/${checkID}`,
    headers: {
      Authorization: `Bearer ${PINGDOM_API_KEY}`,
      "Content-Type": "application/json",
    },
    data: null,
  });

  const checkDetails = checkResponse.data.check;

  // get check results
  const response = await axios({
    method: "GET",
    url: `${PINGDOM_API_URL}/results/${checkID}`,
    headers: {
      Authorization: `Bearer ${PINGDOM_API_KEY}`,
      "Content-Type": "application/json",
    },
    data: null,
  });

  const checkResults = response.data.results;

  const populatedResultLogs = [];

  // fill probe details -> location
  for (const result of checkResults) {
    const probe = probes.find((probe) => probe.id === result.probeid);

    const checkDetail = {
      ...result,
      time_relative: getRelativeTime(result.time),
    };

    if (!probe) {
      // update probes list
      await updateProbesList();
      const probe = probes.find((probe) => probe.id === result.probeid);

      checkDetail.probe = probe;
    }
    populatedResultLogs.push(checkDetail);
  }

  return NextResponse.json(
    {
      check_details: {
        ...checkDetails,
        result_logs: populatedResultLogs,
      },
    },
    { status: 200 }
  );
}
