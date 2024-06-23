"use client";
import React, { useEffect, useState } from "react";
import ChecksListTable from "@/components/ChecksListTable";
import Loader from "@/components/Loader";
import axios from "axios";
import moment from "moment";
import NodesByNP from "../../../nodes_by_np.json";

const App = () => {
  const [fetching, setFetching] = useState(true);
  const [checks, setChecks] = useState([]);
  const [fetchingUptimes, setFetchingUptimes] = useState(false);

  useEffect(() => {
    fetchChecks();
  }, []);

  const fetchChecks = async () => {
    try {
      setFetching(true);
      const response = await axios.get("/api/analytics/checks");
      const checks =
        response.data?.checks?.map((check: any) => ({
          id: check.id,
          site_name: check.name,
          tags: check.tags || [],
          type: check.type?.toUpperCase(),
          uptime: check.uptime || 100,
          up_since: check.upsince,
          response_time: check.lastresponsetime,
          hostname: check.hostname,
        })) || [];

      await fetchUptimes(checks);
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const fetchUptimes = async (checks) => {
    try {
      setFetchingUptimes(true);
      const checksWithUptime = await Promise.all(
        checks.map(async (check: any) => {
          const uptime = await fetchUptimeByCheckID(check.id);
          return {
            ...check,
            uptime,
          };
        })
      );

      const populatedChecks = populateChecksWithNodeDetails(checksWithUptime);
      setChecks(populatedChecks);
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingUptimes(false);
    }
  };

  const populateChecksWithNodeDetails = (checks) => {
    const populatedChecksData = checks.map((check: any) => {
      const node = NodesByNP.find((node) => node.ip_address === check.hostname);
      const valuesToPopulate = {
        node_id: "N/A",
        node_provider_name: check.site_name,
        region: "N/A",
      };
      if (node) {
        valuesToPopulate.node_id = node.node_id;
        valuesToPopulate.node_provider_name = node.node_provider_name;
        valuesToPopulate.region = node.region;
      }

      return {
        ...check,
        ...valuesToPopulate,
      };
    });

    return populatedChecksData;
  };

  const fetchUptimeByCheckID = async (checkID: number) => {
    // Fetch summary average
    try {
      const fromTimestamp = moment().subtract(1, "months").unix();

      const response = await axios.get(
        `/api/analytics/summary.average/${checkID}?includeuptime=true&from=${fromTimestamp}`
      );

      const summary = response.data.summary.status;

      const uptime_percent = (
        (summary.totalup / (summary.totaldown + summary.totalup)) *
        100
      ).toFixed(2);

      return uptime_percent;
    } catch (e) {
      console.error(e);
      return "N/A";
    }
  };

  if (fetching) {
    return (
      <div className="flex w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex w-full">
      <ChecksListTable checks={checks} fetchingUptimes={fetchingUptimes} />
    </div>
  );
};

export default App;
