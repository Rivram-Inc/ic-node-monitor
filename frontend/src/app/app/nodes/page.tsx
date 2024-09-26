"use client";
import React, { useEffect, useState } from "react";
import NodesListTable from "@/components/NodesListTable";
import Loader from "@/components/Loader";
import axios from "axios";

const Nodes = () => {
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
        `/api/analytics/nodes?page=${page}&limit=${50}`
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
            uptime_1h: node.uptime_1h,
            uptime_24h: node.uptime_24h,
            uptime_30d: node.uptime_30d,
            avg_rtt_30d: parseFloat(node.avg_rtt_30d || "0").toFixed(2),
          })) || [];

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

export default Nodes;
