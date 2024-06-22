"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader } from "lucide-react";
import axios from "axios";
import KeyValueCard from "@/components/Cards/KeyValueCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import LogsTable from "@/components/LogsTable";
import moment from "moment";

const CheckReport = () => {
  const params = useParams();
  const checkID = params["check-id"];
  const [checkDetails, setCheckDetails] = React.useState<any>(null);
  const [fetching, setFetching] = React.useState(true);

  useEffect(() => {
    fetchCheckDetails();
  }, []);

  const getSummaryAverage = async () => {
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

      return {
        uptime_percent,
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
      const summary = await getSummaryAverage();
      const data = {
        name: response.data.check_details.name,
        result_logs: response.data.check_details.result_logs,
        uptime: summary.uptime_percent,
        downtime: "an hour",
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
        <Loader />;
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-4">
      <div className="flex w-full justify-start items-center gap-8">
        <div className="w-3/4 h-80 flex bg-slate-100 rounded-sm"></div>
        <div className="w-1/4 h-80 flex flex-col rounded-sm gap-4">
          <KeyValueCard
            title="DOWNTIME"
            value={checkDetails?.downtime || ""}
            subtext="(1 outages)"
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
