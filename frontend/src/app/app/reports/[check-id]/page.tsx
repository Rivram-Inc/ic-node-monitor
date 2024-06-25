"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import KeyValueCard from "@/components/Cards/KeyValueCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import LogsTable from "@/components/LogsTable";
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

const CheckReport = () => {
  const params = useParams();
  const checkID = params["check-id"];
  const [checkDetails, setCheckDetails] = React.useState<any>(null);
  const [fetching, setFetching] = React.useState(true);
  const [fetchingResponseTime, setFetchingResponseTime] = React.useState(true);
  const [averageResponseData, setAverageResponseData] = React.useState<any>([]);
  const [selectedDuration, setSelectedDuration] = React.useState("last_7_days");

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    fetchCheckDetails();
    fetchChecksResponseTime();
  };

  const fetchChecksResponseTime = async () => {
    // Fetch check response time
    try {
      setFetchingResponseTime(true);
      const sevenDaysAgo = moment().subtract(7, "days").unix();

      const response = await axios.get(
        `/api/analytics/summary.performance/${checkID}?includeuptime=true&from=${sevenDaysAgo}`
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
        `/api/analytics/summary.average/${checkID}?includeuptime=true&from=${fromTimestamp}`
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

  const fetchCheckDetails = async () => {
    // Fetch check details by ID
    try {
      const response = await axios.get(
        `/api/analytics/check-details/${checkID}`
      );
      const fetchedCheckDetails = response.data.check_details;
      const checkCreatedAt = moment.unix(fetchedCheckDetails.created);
      const differenceDays = moment().diff(checkCreatedAt, "days");

      const summary = await getSummaryAverage({
        differenceDays,
        createdAt: differenceDays < 7 ? checkCreatedAt.unix() : null,
      });
      const downtimePercent = summary.downtime_percent;

      const totalHoursInWeek = 24 * (differenceDays < 7 ? differenceDays : 7);
      const downtimeInHours = (downtimePercent / 100) * totalHoursInWeek;
      const hostname = fetchedCheckDetails.hostname;

      const found = NodesByNP.find((node: any) => {
        return node.ip_address === hostname;
      });

      const data = {
        name: fetchedCheckDetails.name,
        hostname,
        lat: fetchedCheckDetails.lat,
        long: fetchedCheckDetails.long,
        dcname: found ? found.dc_name : "",
        region: found ? found.region : "",
        result_logs: fetchedCheckDetails.result_logs,
        uptime: summary.uptime_percent,
        downtime: moment.duration(downtimeInHours * 60 * 60 * 1000).humanize(),
      };

      setCheckDetails(data);
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

  return (
    <div className="flex flex-col w-full p-4 pt-0">
      <div
        className="font-bold m-0 p-0 mb-4"
        style={{
          fontSize: "1.5rem",
        }}
      >
        {checkDetails.name}
      </div>
      <div className="flex w-full justify-start items-center gap-8 pb-8 z-0">
        <CheckPingsWorldMap
          checkID={checkID as string}
          checkDetails={checkDetails}
        />
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
      <div className="flex w-full justify-start items-center gap-8">
        <div className="w-3/4 h-80 flex bg-slate-100 rounded-sm">
          <CheckResponseLineChart dataValues={averageResponseData} />
        </div>
        <div className="w-1/4 h-80 flex flex-col rounded-sm gap-4">
          <KeyValueCard
            title="DOWNTIME"
            value={
              checkDetails?.downtime === "a few seconds"
                ? "None"
                : checkDetails?.downtime || ""
            }
            subtext=""
          />
          <KeyValueCard
            title="UPTIME"
            value={checkDetails?.uptime ? `${checkDetails.uptime} %` : ""}
            subtext=""
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
              Test result log
            </TabsTrigger>
          </TabsList>
          <TabsContent value="test_result_log">
            <LogsTable
              logs={
                checkDetails?.result_logs?.map((log) => ({
                  probeid: log.probeid,
                  time: log.time,
                  up: log.status === "up",
                  time_relative: log.time_relative,
                  response_time: log.responsetime,
                  location: log.probe
                    ? `${log.probe.city}, ${log.probe.country}`
                    : "",
                })) || []
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CheckReport;
