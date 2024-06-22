import axios from "axios";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from "next";


function selectTwoNodesPerProvider(nodes) {
    // Filter nodes to only include those with a non-null subnet_id
    // Only system subnet
    const validNodes = nodes.filter(node => node.subnet_id == "w4rem-dv5e3-widiz-wbpea-kbttk-mnzfm-tzrc7-svcj3-kbxyb-zamch-hqe");
  
    // Group nodes by node_provider_name
    const providerGroups = validNodes.reduce((acc, node) => {
      if (!acc[node.node_provider_id]) {
        acc[node.node_provider_id] = [];
      }
      acc[node.node_provider_id].push(node);
      return acc;
    }, {});
  
    // Select up to two nodes per provider
    const selectedNodes = [];
    for (const provider in providerGroups) {
      selectedNodes.push(...providerGroups[provider].slice(0, 1));
    }
  
    // Write the selected nodes to a JSON file
    fs.writeFileSync('nodes_by_np.json', JSON.stringify(selectedNodes, null, 2));
    return selectedNodes;
  }

async function getNodes() {
    // URL of the API endpoint
    const url = 'https://ic-api.internetcomputer.org/api/v3/nodes';

    try {
        // Make the GET request
        const response = await axios.get(url);

        // Check if the request was successful
        if (response.status === 200) {
            // Get the response data
            const data = response.data;
            const nodes = data.nodes;

            // Save response to a file
            fs.writeFileSync('nodes.json', JSON.stringify(nodes, null, 2));

            return nodes;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching nodes:', error);
        return null;
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } }
  ) {
    // Code starts here
    const nodes = await getNodes();

    const selectedNodes = selectTwoNodesPerProvider(nodes);


    const dataCenters = Array.from(
        new Set(
          nodes
            .filter(node => node.dc_id && node.dc_name)  // Filter out nodes without dc_id or dc_name
            .map(node => JSON.stringify({ id: node.dc_id, name: node.dc_name }))
        )
      ).map(str => JSON.parse(str));

    
    return NextResponse.json({count: selectedNodes.length, selectedNodes}, {
        status: 200,
      });
  }