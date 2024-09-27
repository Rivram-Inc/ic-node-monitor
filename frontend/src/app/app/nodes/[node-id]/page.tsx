"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import KeyValueCard from "@/components/Cards/KeyValueCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import moment from "moment";
import Loader from "@/components/Loader";
import CheckResponseLineChart from "@/components/Charts/CheckResponseTimeLineChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CheckPingsWorldMap from "@/components/CheckPingsWorldMap";
import NodesByNP from "../../../../../nodes_by_np.json";
import PingsTable from "@/components/PingsTable";

const NodeDetails = () => {
  const params = useParams();
  const nodeID = params["node-id"];
  const [nodeDetails, setNodeDetails] = React.useState<any>(null);
  const [fetching, setFetching] = React.useState(true);
  const [fetchingResponseTime, setFetchingResponseTime] = React.useState(true);
  const [pingFetching, setPingFetching] = React.useState(true);
  const [averageResponseData, setAverageResponseData] = React.useState<any>([]);
  const [selectedDuration, setSelectedDuration] = React.useState("last_7_days");
  const [pingResults, setPingReults] = React.useState<any>([]);
  const [fetchingChartData, setFetchingChartData] = React.useState(true);
  const [pagination, setPagination] = React.useState<any>({
    totalItems: 10,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });

  const [chartDetails, setChartDetails] = React.useState<any>({
    uptime: null,
    downtime: null,
    chartPoints: [],
  });

  useEffect(() => {
    fetchDetails();
    fetchChartDetails();
  }, []);

  const fetchChartDetails = async () => {
    try {
      setFetchingChartData(true);
      const duration: number = 7;

      const response = await axios.get(
        `/api/analytics/nodes/${nodeID}/chart-data?duration=${duration}`
      );

      if (response.data?.data?.success === false) {
        // TODO: handle error
      }

      const results = response.data.data;
      const uptime = parseFloat(results.uptime || 0).toFixed(2);
      const downtime = parseFloat(results.downtime || 0).toFixed(2);

      const chartPoints =
        results.avg_rtt_data_points?.map((data: any) => {
          return {
            label: moment(data.bucket).format("MMM Do, h A"),
            responseTime: parseFloat(
              data.ip_address_avg_avg_rtt || "0"
            ).toFixed(2),
          };
        }) || [];

      setChartDetails({
        uptime,
        downtime,
        chartPoints,
      });

      setFetchingChartData(false);
    } catch (error) {
      setFetchingChartData(false);
      console.error(error);
    } finally {
      setFetchingChartData(false);
    }
  };

  const fetchDetails = async () => {
    fetchCheckDetails();
    // fetchChecksResponseTime();
  };

  const fetchChecksResponseTime = async () => {
    // Fetch check response time
    try {
      setFetchingResponseTime(true);
      const sevenDaysAgo = moment().subtract(7, "days").unix();

      const response = await axios.get(
        `/api/analytics/summary.performance/${nodeID}?includeuptime=true&from=${sevenDaysAgo}`
      );
      const data = response.data.summary.hours;

      const chartData = data.map((hour: any) => {
        return {
          label: moment.unix(hour.starttime).format("MMM Do"),
          responseTime: hour.avgresponse,
        };
      });
      setAverageResponseData(chartData);
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingResponseTime(false);
    }
  };

  const getSummaryAverage = async ({
    differenceDays,
    createdAt,
  }: {
    differenceDays: number;
    createdAt?: number;
  }) => {
    // Fetch summary average
    try {
      let fromTimestamp = moment().subtract(7, "days").unix();

      if (differenceDays < 7) {
        fromTimestamp = createdAt;
      }

      const response = await axios.get(
        `/api/analytics/summary.average/${nodeID}?includeuptime=true&from=${fromTimestamp}`
      );

      const summary = response.data.summary.status;

      const totalChecks = summary.totaldown + summary.totalup;
      const downtimePercent: number = parseFloat(
        ((summary.totaldown / totalChecks) * 100).toFixed(2)
      );

      const uptimePercent: number = parseFloat(
        ((summary.totalup / totalChecks) * 100).toFixed(2)
      );

      return {
        uptime_percent: uptimePercent,
        downtime_percent: downtimePercent,
      };
    } catch (e) {
      console.error(e);
    }

    return {};
  };

  const fetchNextPage = async () => {
    const nextPage = pagination.currentPage + 1;

    // fetch next page only when we don't have the data
    if (nextPage * pagination.pageSize > pingResults.length) {
      await fetchPingResults(nextPage, nodeDetails.ip_address);
    } else {
      setPagination((curr: any) => ({
        ...curr,
        currentPage: nextPage,
      }));
    }
  };

  const previousPage = async () => {
    const previousPage = pagination.currentPage - 1;
    setPagination((curr: any) => ({
      ...curr,
      currentPage: previousPage,
    }));
  };

  const fetchPingResults = async (page: number = 1, ipAddress: string) => {
    try {
      setPingFetching(true);
      // fetch ping list for the ip address
      const response = await axios.get(
        `/api/analytics/node-details/${ipAddress}?page=${page}&limit=${pagination.pageSize}`
      );
      if (response.status !== 200) {
        // TODO: handle error
        return;
      } else {
        const pingResultsList = response.data.data;
        const paginationDetails = response.data.pagination;

        const pingResultsListItems = pingResultsList.map((ping: any) => ({
          ...ping,
          up: parseFloat(ping.packet_loss) == 0.0,
        }));

        setPingReults((curr: any) => [...curr, ...pingResultsListItems]);
        setPagination({
          totalItems: paginationDetails.totalItems || 10,
          currentPage: paginationDetails.currentPage || 1,
          totalPages: paginationDetails.totalPages || 1,
          pageSize: paginationDetails.pageSize || 10,
        });
      }
    } catch (error) {
      console.error(error);
      setPingFetching(false);
    } finally {
      setPingFetching(false);
    }
  };

  const fetchCheckDetails = async () => {
    // Fetch check details by ID
    try {
      const nodeDetails = await axios.get(`/api/analytics/nodes/${nodeID}`);

      if (nodeDetails.data.success === false) {
        // TODO: handle error
        return;
      }
      const details = nodeDetails.data.data;
      await fetchPingResults(1, details.ip_address);

      const data = {
        name: details.node_provider_name,
        hostname: details.ip_address,
        dcname: details.dc_name,
        region: details.region,
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

      setNodeDetails(data);
      setFetching(false);
    } catch (e) {
      console.error(e);
      //   TODO: handle error
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

  const NodeDetailCardTextRow = ({
    title,
    value,
  }: {
    title: string;
    value: string;
  }) => (
    <h4 className="flex flex-col w-full overflow-hidden whitespace-nowrap mb-2 my-2">
      <div className="font-semibold w-16 flex max-w-16 min-w-16 text-slate-700">
        {title}
      </div>
      <div className="overflow-hidden w-full whitespace-nowrap text-ellipsis text-slate-800">
        {value}
      </div>
    </h4>
  );

  return (
    <div className="flex flex-col w-full p-4">
      <div className="flex md:flex-row flex-col w-full p-6 justify-start items-center overflow-hidden bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 mr-4">
        <div className="flex flex-col w-full md:w-1/3 pr-2">
          <NodeDetailCardTextRow
            title="IP Address"
            value={nodeDetails?.ip_address}
          />
          <NodeDetailCardTextRow title="DC Name" value={nodeDetails?.dc_name} />
          <NodeDetailCardTextRow title="Region" value={nodeDetails?.region} />
        </div>
        <div className="flex flex-col w-full md:w-1/3 pr-2">
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
        <div className="flex flex-col w-full md:w-1/3 pr-2">
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
      </div>

      <div className="flex w-full justify-start items-center gap-8 pb-8 mt-6 rounded-sm">
        <CheckPingsWorldMap nodeDetails={nodeDetails} />
      </div>
      <div className="flex w-full justify-start items-center gap-8 pb-8">
        <Select value={selectedDuration}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_7_days">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col md:flex-row w-full justify-start items-center gap-8">
        <div className="w-full md:w-3/4 h-80 flex bg-slate-100 rounded-sm">
          <CheckResponseLineChart dataValues={chartDetails.chartPoints} />
        </div>
        <div className="w-full md:w-1/4 h-80 flex flex-col rounded-sm gap-4">
          <KeyValueCard
            title="DOWNTIME"
            value={chartDetails?.downtime ? `${chartDetails.downtime} %` : ""}
            subtext=""
          />
          <KeyValueCard
            title="UPTIME"
            value={chartDetails?.uptime ? `${chartDetails.uptime} %` : ""}
            subtext=""
          />
        </div>
      </div>
      <hr className="text-slate-400 w-full my-8" />
      <div className="flex md:flex-row flex-col w-full justify-start items-center overflow-hidden gap-8">
        <div className="flex flex-col w-full md:w-1/3 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 md:mr-4">
          <h1 className="mb-2 text-xl font-bold tracking-tight text-gray-900">
            1 hour
          </h1>
          <hr className="text-slate-400 w-full my-1" />
          <NodeDetailCardTextRow
            title="Min. average RTT"
            value={nodeDetails?.one_hour_min_avg_rtt}
          />
          <NodeDetailCardTextRow
            title="Max. average RTT"
            value={nodeDetails?.one_hour_max_avg_rtt}
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
          />
          <NodeDetailCardTextRow
            title="Max. average RTT"
            value={nodeDetails?.twentyfour_hours_max_avg_rtt}
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
          />
          <NodeDetailCardTextRow
            title="Max. average RTT"
            value={nodeDetails?.thirty_days_max_avg_rtt}
          />
        </div>
      </div>
      <hr className="text-slate-400 w-full my-8" />
      <div className="flex w-full flex-col h-full">
        <Tabs defaultValue="test_result_log" className="w-full">
          <TabsList
            className="grid w-full grid-cols-2"
            style={{ borderBottom: "1px solid #eaeaea" }}
          >
            <TabsTrigger
              value="test_result_log"
              className="bg-slate-100 p-2 rounded-sm text-center cursor-pointer"
              style={{
                width: "11rem",
              }}
            >
              Ping results
            </TabsTrigger>
          </TabsList>
          <TabsContent value="test_result_log">
            <PingsTable
              logs={pingResults || []}
              pagination={pagination}
              fetchNextPage={fetchNextPage}
              previousPage={previousPage}
              pingFetching={pingFetching}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NodeDetails;
