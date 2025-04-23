import fs from "fs";
import path from "path";
import axios from "axios";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";
import ProbesLatLong from "../../../../../../public/utils/probes-lat-long.json";
import NodesByNP from "../../../../../../nodes_by_np.json";

// constants
const PINGDOM_API_KEY =
  "7S-LOihA3ooDAjkU0HUVk84yPiDQTnYDAiqAAE1EFz0mTZ25oq8CVXOZtiVeQvDMQZ4L8W8";
const PINGDOM_API_URL = "https://api.pingdom.com/api/3.1";
const __dirname = path.resolve();
const probes = []; // Probes list

// get lat long of city and country
const geocodeCityCountry = async (city: string, country: string) => {
  const url = `https://nominatim.openstreetmap.org/search?city=${city}&country=${country}&format=json&limit=1`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } else {
      console.error(`No results found for ${city}, ${country}`);
      return null;
    }
  } catch (error) {
    console.error(`Error geocoding ${city}, ${country}:`, error);
    return null;
  }
};

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
    let found: any = ProbesLatLong.find((p) => p.id === probe.id);

    if (!found) {
      const location = await geocodeCityCountry(probe.city, probe.country);
      if (location) {
        found = { id: probe.id, ...location };
        const updatedProbesList = [
          ...ProbesLatLong,
          {
            ...probe,
            ...found,
          },
        ];

        // Update probes-lat-long.json (use fs module)
        fs.writeFileSync(
          path.join(__dirname, "/public/utils/probes-lat-long.json"),
          JSON.stringify(updatedProbesList, null, 2)
        );
      }
    }

    probes.push({
      id: probe.id,
      name: probe.name,
      country: probe.country,
      countryiso: probe.countryiso,
      city: probe.city,
      lat: found?.latitude,
      long: found?.longitude,
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

  const checkNode = NodesByNP.find(
    (node) => node.ip_address === checkDetails.hostname
  );

  if (checkNode) {
    const [_continent, country, city] = checkNode.region.split(",");
    const checkLocation = await geocodeCityCountry(city, country);

    if (checkLocation) {
      checkDetails.lat = checkLocation.latitude;
      checkDetails.long = checkLocation.longitude;
    }
  }

  if (checkDetails?.name === "Linode server") {
    checkDetails.lat = 43.6534817;
    checkDetails.long = -79.3839347;
  }

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
    let probe = probes.find((probe) => probe.id === result.probeid);

    const checkDetail = {
      ...result,
      time_relative: getRelativeTime(result.time),
      responsetime: result.responsetime || result.statusdesclong,
    };

    if (!probe) {
      // update probes list
      await updateProbesList();
      probe = probes.find((probe) => probe.id === result.probeid);
    }
    populatedResultLogs.push({ ...checkDetail, probe });
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
