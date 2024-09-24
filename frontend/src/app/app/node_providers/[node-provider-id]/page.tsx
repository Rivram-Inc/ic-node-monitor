"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import NodeProviderNodesListTable from "@/components/NodeProviderNodesListTable";
import Loader from "@/components/Loader";
import { useParams } from "next/navigation";

const NodeProviderNodesListPage = () => {
  const params = useParams();
  const nodeProviderID = params["node-provider-id"];

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
        `/api/analytics/nodes?page=${page}&limit=${100}&node_provider_id=${nodeProviderID}`
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

  const DetailCardTextRow = ({
    title,
    value,
  }: {
    title: string;
    value: string;
  }) => (
    <h4 className="flex flex-col w-full overflow-hidden whitespace-nowrap mb-2">
      <div className="font-bold w-16 flex max-w-16 min-w-16">{title}</div>
      <div className="overflow-hidden w-full whitespace-nowrap text-ellipsis">
        {value}
      </div>
    </h4>
  );

  if (fetching) {
    return (
      <div className="flex w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {nodes?.length ? (
        <div
          className="flex w-full justify-start items-center p-2 rounded-sm overflow-hidden mb-4"
          style={{
            boxShadow: "4px 4px 2px 1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <DetailCardTextRow
            title="Node Provider"
            value={nodes[0]?.node_provider_name}
          />
          <DetailCardTextRow
            title="Total Nodes"
            value={pagination.totalItems?.toLocaleString() || "-"}
          />
        </div>
      ) : null}
      <NodeProviderNodesListTable
        nodes={nodes}
        fetchingUptimes={fetchingUptimes}
        pagination={pagination}
        fetchNextPage={fetchNextPage}
        previousPage={previousPage}
      />
    </div>
  );
};

export default NodeProviderNodesListPage;
