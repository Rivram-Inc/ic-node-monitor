"use client";
import React, { useEffect, useState } from "react";
import NodesListTable from "@/components/NodesListTable";
import Loader from "@/components/Loader";
import axios from "axios";
import moment from "moment";
import NodesByNP from "../../../nodes_by_np.json";

const App = () => {
  const [fetching, setFetching] = useState(true);
  const [nodes, setNodes] = useState([]);
  const [fetchingUptimes, setFetchingUptimes] = useState(false);
  const [pagination, setPagination] = useState({
    totalItems: 10,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });

  useEffect(() => {
    fetchNodes(1);
  }, []);

  const fetchNextPage = async () => {
    const nextPage = pagination.currentPage + 1;

    // fetch next page only when we don't have the data
    if (nextPage * pagination.pageSize > nodes.length) {
      await fetchNodes(nextPage);
    } else {
      setPagination((curr) => ({
        ...curr,
        currentPage: nextPage,
      }));
    }
  };

  const previousPage = async () => {
    const previousPage = pagination.currentPage - 1;
    setPagination((curr) => ({
      ...curr,
      currentPage: previousPage,
    }));
  };

  const fetchNodes = async (page: number) => {
    try {
      setFetching(true);
      const response = await axios.get(
        `/api/analytics/nodes?page=${page}&limit=${10}`
      );
      if (response.status !== 200) {
        // TODO: handle error
      } else {
        const nodes = response.data.data;
        const paginationDetails = response.data.pagination;
        const nodesList =
          nodes?.map((node: any) => ({
            id: node.node_id,
            node_id: node.node_id,
            site_name: "",
            tags: node.tags || [],
            type: node.node_type?.toUpperCase(),
            uptime: node.uptime || 100,
            up_since: node.upsince,
            region: node.region,
            response_time: node.lastresponsetime,
            hostname: node.hostname,
            node_provider_name: node.node_provider_name,
            node_provider_id: node.node_provider_id,
          })) || [];
        // await fetchUptimes(nodes);

        setPagination({
          totalItems: paginationDetails.totalItems || 10,
          currentPage: paginationDetails.currentPage || 1,
          totalPages: paginationDetails.totalPages || 1,
          pageSize: paginationDetails.pageSize || 10,
        });
        setNodes((curr) => [...curr, ...nodesList]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  // const fetchUptimes = async (checks) => {
  //   try {
  //     setFetchingUptimes(true);
  //     const checksWithUptime = await Promise.all(
  //       checks.map(async (check: any) => {
  //         const uptime = await fetchUptimeByCheckID(check.id);
  //         return {
  //           ...check,
  //           uptime,
  //         };
  //       })
  //     );

  //     const populatedChecks = populateChecksWithNodeDetails(checksWithUptime);
  //     setNodes(populatedChecks);
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     setFetchingUptimes(false);
  //   }
  // };

  // const populateChecksWithNodeDetails = (checks) => {
  //   const populatedChecksData = checks
  //     .map((check: any) => {
  //       const node = NodesByNP.find(
  //         (node) => node.ip_address === check.hostname
  //       );
  //       const valuesToPopulate = {
  //         node_id: "N/A",
  //         node_provider_name: check.site_name,
  //         region: "N/A",
  //       };
  //       if (node) {
  //         valuesToPopulate.node_id = node.node_id;
  //         valuesToPopulate.node_provider_name = node.node_provider_name;
  //         valuesToPopulate.region = node.region;
  //       }

  //       return {
  //         ...check,
  //         ...valuesToPopulate,
  //       };
  //     })
  //     .filter((check: any) => {
  //       if (check.site_name === "Linode server") return true;
  //       return check.node_id !== "N/A";
  //     });

  //   return populatedChecksData;
  // };

  // const fetchUptimeByCheckID = async (checkID: number) => {
  //   // Fetch summary average
  //   try {
  //     const fromTimestamp = moment().subtract(7, "days").unix();

  //     const response = await axios.get(
  //       `/api/analytics/summary.average/${checkID}?includeuptime=true&from=${fromTimestamp}`
  //     );

  //     const summary = response.data.summary.status;

  //     const uptime_percent = (
  //       (summary.totalup / (summary.totaldown + summary.totalup)) *
  //       100
  //     ).toFixed(2);

  //     return uptime_percent;
  //   } catch (e) {
  //     console.error(e);
  //     return "N/A";
  //   }
  // };

  if (fetching) {
    return (
      <div className="flex w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex w-full">
      <NodesListTable
        nodes={nodes}
        fetchingUptimes={fetchingUptimes}
        pagination={pagination}
        fetchNextPage={fetchNextPage}
        previousPage={previousPage}
      />
    </div>
  );
};

export default App;
