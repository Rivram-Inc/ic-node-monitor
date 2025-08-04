"use client";
import React, { useEffect, useCallback, useMemo, Suspense } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import KeyValueCard from "@/components/Cards/KeyValueCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import moment from "moment";
import Loader from "@/components/Loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import NodeDetailCardTextRow from "@/components/Cards/NodeDetailCardTextRow";

// Lazy load heavy components
const CheckResponseLineChart = React.lazy(
  () => import("@/components/Charts/CheckResponseTimeLineChart")
);
const CheckPingsWorldMap = React.lazy(
  () => import("@/components/CheckPingsWorldMap")
);
const PingsTable = React.lazy(() => import("@/components/PingsTable"));
const UptimeChangesTable = React.lazy(
  () => import("@/components/UptimeChangesTable")
);

// Create axios instance
const apiClient = axios.create({});

interface NodeDetails {
  name: string;
  hostname: string;
  dcname: string;
  region: string;
  geo_ip_location: string;
  status: string;
  type: string;
  uptime: string;
  downtime: string;
  lat: number;
  long: number;
  ip_address: string;
  result_logs: any[];
  owner: string;
  node_type: string;
  node_provider_name: string;
  node_provider_id: string;
  node_operator_id: string;
  dc_name: string;
  one_hour_min_avg_rtt: string;
  one_hour_max_avg_rtt: string;
  twentyfour_hours_min_avg_rtt: string;
  twentyfour_hours_max_avg_rtt: string;
  thirty_days_min_avg_rtt: string;
  thirty_days_max_avg_rtt: string;
  probes: any[];
}

interface ChartDetails {
  uptime: string | null;
  downtime: string | null;
  chartPoints: Record<string, any[]>;
}

interface Pagination {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

const NodeDetails = () => {
  const params = useParams();
  const nodeID = params["node-id"];

  // Consolidated state
  const [nodeDetails, setNodeDetails] = React.useState<NodeDetails | null>(
    null
  );
  const [loadingStates, setLoadingStates] = React.useState({
    fetching: true,
    fetchingChartData: true,
    pingFetching: true,
    fetchingUptimeChanges: false,
  });

  const [selectedDuration, setSelectedDuration] = React.useState(7);
  const [pingResults, setPingResults] = React.useState<any[]>([]);
  const [uptimeChanges, setUptimeChanges] = React.useState<any[]>([]);
  const [pagination, setPagination] = React.useState<Pagination>({
    totalItems: 10,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });
  const [chartDetails, setChartDetails] = React.useState<ChartDetails>({
    uptime: null,
    downtime: null,
    chartPoints: {},
  });

  // Memoized update functions to prevent unnecessary re-renders
  const updateLoadingState = useCallback(
    (key: keyof typeof loadingStates, value: boolean) => {
      setLoadingStates((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Memoized chart data processing
  const processChartData = useCallback((results: any) => {
    const uptime = parseFloat(results.uptime || 0).toFixed(2);
    const downtime = parseFloat(results.downtime || 0).toFixed(2);

    const chartPoints: Record<string, any[]> = {};

    Object.keys(results.avg_rtt_data_points).forEach((probeName: string) => {
      chartPoints[probeName] = results.avg_rtt_data_points[probeName].map(
        (data: any) => ({
          label: moment(data.bucket).format("MMM Do, h A"),
          responseTime: parseFloat(data.ip_address_avg_avg_rtt || "0").toFixed(
            2
          ),
        })
      );
    });

    return { uptime, downtime, chartPoints };
  }, []);

  const fetchChartDetails = useCallback(
    async (duration: number) => {
      try {
        updateLoadingState("fetchingChartData", true);
        setSelectedDuration(duration);

        const response = await apiClient.get(
          `/api/analytics/nodes/${nodeID}/chart-data?duration=${duration}`
        );

        if (response.data?.data?.success === false) {
          throw new Error("Failed to fetch chart data");
        }

        const processedData = processChartData(response.data.data);
        setChartDetails(processedData);
      } catch (error) {
        console.error("Error fetching chart details:", error);
        // Set fallback data
        setChartDetails({
          uptime: null,
          downtime: null,
          chartPoints: {},
        });
      } finally {
        updateLoadingState("fetchingChartData", false);
      }
    },
    [nodeID, processChartData, updateLoadingState]
  );

  const fetchUptimeChanges = useCallback(async () => {
    try {
      updateLoadingState("fetchingUptimeChanges", true);

      const response = await apiClient.get(
        `/api/analytics/nodes/${nodeID}/uptime-changes`
      );

      const processedChanges =
        response.data.data?.map((change: any) => {
          const duration = moment
            .duration({
              milliseconds: change.duration.milliseconds || 0,
              seconds: change.duration.seconds || 0,
              minutes: change.duration.minutes || 0,
              hours: change.duration.hours || 0,
            })
            .humanize();

          return { ...change, duration };
        }) || [];

      setUptimeChanges(processedChanges);
    } catch (error) {
      console.error("Error fetching uptime changes:", error);
      setUptimeChanges([]);
    } finally {
      updateLoadingState("fetchingUptimeChanges", false);
    }
  }, [nodeID, updateLoadingState]);

  const fetchPingResults = useCallback(
    async (page: number = 1, ipAddress: string) => {
      try {
        updateLoadingState("pingFetching", true);

        const response = await apiClient.get(
          `/api/analytics/node-details/${ipAddress}?page=${page}&limit=${pagination.pageSize}`
        );

        if (response.status !== 200) {
          throw new Error("Failed to fetch ping results");
        }

        const pingResultsList = response.data.data || [];
        const paginationDetails = response.data.pagination || {};

        const processedResults = pingResultsList.map((ping: any) => ({
          ...ping,
          avg_rtt:
            ping.packets_received > 0
              ? parseFloat(ping.avg_rtt).toFixed(2)
              : "N/A",
          up: parseFloat(ping.packet_loss) === 0.0,
        }));

        setPingResults((prev) => [...prev, ...processedResults]);
        setPagination({
          totalItems: paginationDetails.totalItems || 10,
          currentPage: paginationDetails.currentPage || 1,
          totalPages: paginationDetails.totalPages || 1,
          pageSize: paginationDetails.pageSize || 10,
        });
      } catch (error) {
        console.error("Error fetching ping results:", error);
      } finally {
        updateLoadingState("pingFetching", false);
      }
    },
    [pagination.pageSize, updateLoadingState]
  );

  // Optimized node details fetching
  const fetchNodeDetails = useCallback(async () => {
    try {
      updateLoadingState("fetching", true);

      const response = await apiClient.get(`/api/analytics/nodes/${nodeID}`);

      if (response.data.success === false) {
        throw new Error("Failed to fetch node details");
      }

      const details = response.data.data;
      const geoIPDetails = details.geo_ip_details;

      const processedDetails: NodeDetails = {
        name: details.node_provider_name,
        hostname: details.ip_address,
        dcname: details.dc_name,
        region: details.region || "-",
        geo_ip_location: geoIPDetails
          ? `${geoIPDetails.city}, ${geoIPDetails.region}, ${geoIPDetails.country}`
          : "-",
        status: details.status,
        type: details.node_type,
        uptime: details.uptime,
        downtime: details.downtime,
        lat: details.datacenter.latitude,
        long: details.datacenter.longitude,
        ip_address: details.ip_address,
        result_logs: details.result_logs,
        owner: details.owner,
        node_type: details.node_type,
        node_provider_name: details.node_provider_name,
        node_provider_id: details.node_provider_id,
        node_operator_id: details.node_operator_id,
        dc_name: details.dc_name,
        one_hour_min_avg_rtt: details.one_hour_min_avg_rtt,
        one_hour_max_avg_rtt: details.one_hour_max_avg_rtt,
        twentyfour_hours_min_avg_rtt: details.twentyfour_hours_min_avg_rtt,
        twentyfour_hours_max_avg_rtt: details.twentyfour_hours_max_avg_rtt,
        thirty_days_min_avg_rtt: details.thirty_days_min_avg_rtt,
        thirty_days_max_avg_rtt: details.thirty_days_max_avg_rtt,
        probes: details.probes,
      };

      setNodeDetails(processedDetails);

      // Fetch ping results after getting IP address
      await fetchPingResults(1, processedDetails.ip_address);
    } catch (error) {
      console.error("Error fetching node details:", error);
    } finally {
      updateLoadingState("fetching", false);
    }
  }, [nodeID, fetchPingResults, updateLoadingState]);

  // Optimized pagination handlers
  const fetchNextPage = useCallback(async () => {
    if (!nodeDetails) return;

    const nextPage = pagination.currentPage + 1;

    if (nextPage * pagination.pageSize > pingResults.length) {
      await fetchPingResults(nextPage, nodeDetails.ip_address);
    } else {
      setPagination((prev) => ({ ...prev, currentPage: nextPage }));
    }
  }, [nodeDetails, pagination, pingResults.length, fetchPingResults]);

  const previousPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
  }, []);

  // Initial data fetching - using Promise.all for parallel requests
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch node details first as other requests depend on it
        await fetchNodeDetails();

        // Then fetch chart data and uptime changes in parallel
        await Promise.all([fetchChartDetails(7), fetchUptimeChanges()]);
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();
  }, [fetchNodeDetails, fetchChartDetails, fetchUptimeChanges]);

  // Memoized RTT cards to prevent unnecessary re-renders
  const RTTCards = useMemo(
    () => (
      <div className="flex md:flex-row flex-col w-full justify-start items-center overflow-hidden gap-8">
        <div className="flex flex-col w-full md:w-1/3 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 md:mr-4">
          <h1 className="mb-2 text-xl font-bold tracking-tight text-gray-900">
            1 hour
          </h1>
          <hr className="text-slate-400 w-full my-1" />
          <NodeDetailCardTextRow
            title="Min. average RTT"
            value={nodeDetails?.one_hour_min_avg_rtt}
            unit="ms"
          />
          <NodeDetailCardTextRow
            title="Max. average RTT"
            value={nodeDetails?.one_hour_max_avg_rtt}
            unit="ms"
          />
        </div>
        <div className="flex flex-col p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 w-full md:w-1/3 md:mr-3">
          <h1 className="mb-2 text-xl font-bold tracking-tight text-gray-900">
            24 hours
          </h1>
          <hr className="text-slate-400 w-full my-1" />
          <NodeDetailCardTextRow
            title="Min. average RTT"
            value={nodeDetails?.twentyfour_hours_min_avg_rtt}
            unit="ms"
          />
          <NodeDetailCardTextRow
            title="Max. average RTT"
            value={nodeDetails?.twentyfour_hours_max_avg_rtt}
            unit="ms"
          />
        </div>
        <div className="flex flex-col p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 w-full md:w-1/3">
          <h1 className="mb-2 text-xl font-bold tracking-tight text-gray-900">
            30 days
          </h1>
          <hr className="text-slate-400 w-full my-1" />
          <NodeDetailCardTextRow
            title="Min. average RTT"
            value={nodeDetails?.thirty_days_min_avg_rtt}
            unit="ms"
          />
          <NodeDetailCardTextRow
            title="Max. average RTT"
            value={nodeDetails?.thirty_days_max_avg_rtt}
            unit="ms"
          />
        </div>
      </div>
    ),
    [nodeDetails]
  );

  if (loadingStates.fetching) {
    return (
      <div className="flex w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col w-full p-4"
    >
      {/* Node Details Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex md:flex-row flex-col w-full p-6 justify-start items-center overflow-hidden bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 mr-4"
      >
        <div className="flex flex-col w-full md:w-1/3 pr-2">
          <NodeDetailCardTextRow
            title="IP Address"
            value={nodeDetails?.ip_address}
          />
          <NodeDetailCardTextRow title="DC Name" value={nodeDetails?.dc_name} />
          <NodeDetailCardTextRow
            title="Region"
            value={nodeDetails?.region}
            info="The region of the node"
          />
          <NodeDetailCardTextRow
            title="Geo IP Location"
            value={nodeDetails?.geo_ip_location}
            info="The location of the node based on the Geo IP details"
          />
        </div>
        <div className="flex flex-col w-full md:w-1/3 pr-2 mb-auto">
          <NodeDetailCardTextRow title="Owner" value={nodeDetails?.owner} />
          <NodeDetailCardTextRow
            title="Node Type"
            value={nodeDetails?.node_type}
          />
          <NodeDetailCardTextRow
            title="Node Provider"
            value={nodeDetails?.node_provider_name}
          />
        </div>
        <div className="flex flex-col w-full md:w-1/3 pr-2 mb-auto">
          <NodeDetailCardTextRow title="Status" value={nodeDetails?.status} />
          <NodeDetailCardTextRow
            title="Node Provider ID"
            value={nodeDetails?.node_provider_id}
          />
          <NodeDetailCardTextRow
            title="Node Operator ID"
            value={nodeDetails?.node_operator_id}
          />
        </div>
      </motion.div>

      {/* World Map */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex w-full justify-start items-center gap-8 pb-8 mt-6 rounded-sm"
      >
        <Suspense
          fallback={
            <div className="w-full h-64 flex items-center justify-center">
              <Loader />
            </div>
          }
        >
          <CheckPingsWorldMap
            nodeDetails={nodeDetails}
            fetching={loadingStates.fetching}
          />
        </Suspense>
      </motion.div>

      {/* Duration Selector */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex w-full justify-start items-center gap-8 pb-8"
      >
        <Select
          value={`${selectedDuration}`}
          onValueChange={(value) => fetchChartDetails(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24">Last 24 hours</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Chart and Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="flex flex-col md:flex-row w-full justify-start items-center gap-8"
      >
        <div className="w-full md:w-3/4 h-80 flex bg-slate-100 rounded-sm">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <Loader />
              </div>
            }
          >
            <CheckResponseLineChart
              dataValues={chartDetails.chartPoints}
              loading={loadingStates.fetchingChartData}
            />
          </Suspense>
        </div>
        <div className="w-full md:w-1/4 h-80 flex flex-col rounded-sm gap-4">
          <KeyValueCard
            title="DOWNTIME"
            value={chartDetails?.downtime ? `${chartDetails.downtime} %` : ""}
            subtext=""
            loading={loadingStates.fetchingChartData}
          />
          <KeyValueCard
            title="UPTIME"
            value={chartDetails?.uptime ? `${chartDetails.uptime} %` : ""}
            subtext=""
            loading={loadingStates.fetchingChartData}
          />
        </div>
      </motion.div>

      <hr className="text-slate-400 w-full my-8" />

      {/* RTT Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        {RTTCards}
      </motion.div>

      <hr className="text-slate-400 w-full my-8" />

      {/* Tabs */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="flex w-full flex-col h-full"
      >
        <Tabs defaultValue="test_result_log" className="w-full">
          <TabsList
            className="flex w-full gap-4 pb-2"
            style={{ borderBottom: "1px solid #eaeaea" }}
          >
            <TabsTrigger
              value="test_result_log"
              className="bg-slate-100 p-2 pl-4 rounded-sm text-left cursor-pointer transition-all duration-300 hover:bg-slate-200 data-[state=active]:bg-slate-500 data-[state=active]:text-white whitespace-nowrap"
              style={{ minWidth: "11rem" }}
            >
              Ping results
            </TabsTrigger>
            <TabsTrigger
              value="uptime_changes"
              className="bg-slate-100 p-2 rounded-sm text-left cursor-pointer transition-all duration-300 hover:bg-slate-200 data-[state=active]:bg-slate-500 data-[state=active]:text-white whitespace-nowrap"
              style={{ minWidth: "11rem" }}
            >
              Uptime changes (24h)
            </TabsTrigger>
          </TabsList>
          <TabsContent value="test_result_log">
            <Suspense
              fallback={
                <div className="w-full h-32 flex items-center justify-center">
                  <Loader />
                </div>
              }
            >
              <PingsTable
                logs={pingResults}
                pagination={pagination}
                fetchNextPage={fetchNextPage}
                previousPage={previousPage}
                pingFetching={loadingStates.pingFetching}
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="uptime_changes">
            <Suspense
              fallback={
                <div className="w-full h-32 flex items-center justify-center">
                  <Loader />
                </div>
              }
            >
              <UptimeChangesTable
                loading={loadingStates.fetchingUptimeChanges}
                uptimeChanges={uptimeChanges}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default NodeDetails;
