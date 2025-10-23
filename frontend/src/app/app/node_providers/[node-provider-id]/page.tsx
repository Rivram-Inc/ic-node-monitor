"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import NodeProviderNodesListTable from "@/components/NodeProviderNodesListTable";
import NodeProviderRewardsCard from "@/components/NodeProviderRewardsCard";
import NodeRewardsTable from "@/components/NodeRewardsTable";
import Loader from "@/components/Loader";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import moment from "moment";

const NodeProviderNodesListPage = () => {
  const params = useParams();
  const nodeProviderID = params["node-provider-id"];

  const [fetching, setFetching] = useState(true);
  const [nodes, setNodes] = useState([]);
  const [fetchingRewards, setFetchingRewards] = useState(false);
  const [fetchingNodeRewards, setFetchingNodeRewards] = useState(false);
  const [rewardsData, setRewardsData] = useState<any>(null);
  const [nodeRewards, setNodeRewards] = useState<any[]>([]);
  const [rewardsPagination, setRewardsPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [pagination, setPagination] = useState({
    totalItems: 10,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });

  useEffect(() => {
    fetchNodes(1);
    fetchProviderRewards();
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
            avg_rtt_30d: Number.parseFloat(node.avg_rtt_30d || "0").toFixed(2),
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

  const fetchProviderRewards = async () => {
    try {
      setFetchingRewards(true);
      const response = await axios.get(
        `/api/analytics/providers/${nodeProviderID}/rewards?days=30`
      );
      if (response.status === 200) {
        setRewardsData(response.data.latestPeriod);
      }
    } catch (error) {
      console.error("Error fetching provider rewards:", error);
    } finally {
      setFetchingRewards(false);
    }
  };

  const fetchNodeRewards = async (page: number = 1) => {
    try {
      setFetchingNodeRewards(true);
      
      // Get the latest rewarding period date if available
      const endDate = rewardsData?.date || moment().format("YYYY-MM-DD");
      const startDate = moment(endDate).subtract(7, "days").format("YYYY-MM-DD");
      
      const response = await axios.get(
        `/api/analytics/providers/${nodeProviderID}/nodes-performance?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=50`
      );
      
      if (response.status === 200) {
        const performance = response.data.performance || [];
        
        // Fetch conversion rates for the period
        const conversionResponse = await axios.get(
          `/api/analytics/conversion-rates?date=${endDate}`
        );
        
        const conversionRate = conversionResponse.data.rate?.xdr_to_icp || 3;
        
        // Aggregate by node_id to show summary
        const nodeMap = new Map();
        
        for (const perf of performance) {
          if (!nodeMap.has(perf.node_id)) {
            nodeMap.set(perf.node_id, {
              node_id: perf.node_id,
              day_utc: perf.day_utc,
              node_status: perf.node_status,
              base_rewards_xdr: 0,
              adjusted_rewards_xdr: 0,
              adjusted_rewards_icp: 0,
              relative_fr: 0,
              performance_multiplier: 0,
              rewards_reduction: 0,
              count: 0,
            });
          }
          
          const node = nodeMap.get(perf.node_id);
          node.base_rewards_xdr += perf.base_rewards_xdr || 0;
          node.adjusted_rewards_xdr += perf.adjusted_rewards_xdr || 0;
          node.adjusted_rewards_icp += (perf.adjusted_rewards_xdr || 0) * conversionRate;
          // Use relative_fr if available, otherwise fall back to daily_failure_rate
          node.relative_fr += perf.relative_fr || perf.daily_failure_rate || 0;
          node.rewards_reduction += perf.rewards_reduction || 0;
          node.count += 1;
          
          // Use latest status and multiplier
          node.node_status = perf.node_status;
          node.performance_multiplier = 1 - (perf.rewards_reduction || 0) / 100;
        }
        
        // Calculate averages
        const nodeRewardsList = Array.from(nodeMap.values()).map((node: any) => ({
          ...node,
          relative_fr: node.relative_fr / node.count,
          rewards_reduction: node.rewards_reduction / node.count,
          performance_multiplier: node.performance_multiplier,
        }));
        
        setNodeRewards(nodeRewardsList);
        setRewardsPagination(response.data.pagination || {
          page: 1,
          limit: 50,
          total: nodeRewardsList.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        });
      }
    } catch (error) {
      console.error("Error fetching node rewards:", error);
    } finally {
      setFetchingNodeRewards(false);
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

      {/* Rewards Summary Card */}
      <div className="mb-6">
        <NodeProviderRewardsCard
          rewardsData={rewardsData}
          loading={fetchingRewards}
        />
      </div>

      {/* Tabs for Nodes and Rewards */}
      <Tabs defaultValue="nodes" className="w-full">
        <TabsList
          className="flex w-full gap-4 pb-2 mb-6"
          style={{ borderBottom: "1px solid #eaeaea" }}
        >
          <TabsTrigger
            value="nodes"
            className="bg-slate-100 p-2 px-4 rounded-sm text-left cursor-pointer transition-all duration-300 hover:bg-slate-200 data-[state=active]:bg-slate-500 data-[state=active]:text-white whitespace-nowrap"
          >
            Nodes List
          </TabsTrigger>
          <TabsTrigger
            value="rewards"
            onClick={() => {
              if (nodeRewards.length === 0 && !fetchingNodeRewards) {
                fetchNodeRewards(1);
              }
            }}
            className="bg-slate-100 p-2 px-4 rounded-sm text-left cursor-pointer transition-all duration-300 hover:bg-slate-200 data-[state=active]:bg-slate-500 data-[state=active]:text-white whitespace-nowrap"
          >
            Node Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nodes">
          <NodeProviderNodesListTable
            nodes={nodes}
            fetchingUptimes={false}
            pagination={pagination}
            fetchNextPage={fetchNextPage}
            previousPage={previousPage}
          />
        </TabsContent>

        <TabsContent value="rewards">
          <NodeRewardsTable
            rewards={nodeRewards}
            loading={fetchingNodeRewards}
            pagination={rewardsPagination}
            onNextPage={() => fetchNodeRewards(rewardsPagination.page + 1)}
            onPrevPage={() => fetchNodeRewards(rewardsPagination.page - 1)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NodeProviderNodesListPage;
