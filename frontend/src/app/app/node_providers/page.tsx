"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import NodeProvidersListTable from "@/components/NodeProvidersListTable";

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
        `/api/analytics/node_providers?page=${page}&limit=${100}`
      );
      if (response.status !== 200) {
        // TODO: handle error
      } else {
        const nodeProviders = response.data.data;
        const paginationDetails = response.data.pagination;
        const nodeProvidersList =
          nodeProviders?.map((node: any) => ({
            uptime_30d: node.uptime_30d || 100,
            node_provider_name: node.node_provider_name,
            node_provider_id: node.node_provider_id,
          })) || [];

        setPagination({
          totalItems: paginationDetails.totalItems || 10,
          currentPage: paginationDetails.currentPage || 1,
          totalPages: paginationDetails.totalPages || 1,
          pageSize: paginationDetails.pageSize || 10,
        });
        setNodes((curr) => [...curr, ...nodeProvidersList]);
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
      <NodeProvidersListTable
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
