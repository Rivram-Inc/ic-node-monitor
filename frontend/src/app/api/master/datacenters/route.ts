import axios from "axios";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from "next";

async function getDataCenters() {
    // URL of the API endpoint
    const url = 'https://ic-api.internetcomputer.org/api/v3/data-centers';

    try {
        // Make the GET request
        const response = await axios.get(url);

        // Check if the request was successful
        if (response.status === 200) {
            // Get the response data
            const data = response.data;
            const dataCenters = data.data_centers;

            // Save response to a file
            fs.writeFileSync('data-centers.json', JSON.stringify(dataCenters, null, 2));

            return dataCenters;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching dataCenters:', error);
        return null;
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } }
  ) {
    // Code starts here
  
    const datacenters = await getDataCenters();

    return NextResponse.json(datacenters, {
        status: 200,
      });
}