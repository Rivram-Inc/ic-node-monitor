"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader } from "lucide-react";
import axios from "axios";
import KeyValueCard from "@/components/Cards/KeyValueCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import LogsTable from "@/components/LogsTable";

const CheckReport = () => {
  const params = useParams();
  const checkID = params["check-id"];
  const [checkDetails, setCheckDetails] = React.useState<any>(null);
  const [fetching, setFetching] = React.useState(true);

  useEffect(() => {
    fetchCheckDetails();
  }, []);

  const fetchCheckDetails = async () => {
    // Fetch check details by ID
    try {
      const response = await axios.get(`/api/analytics/checks/${checkID}`);
      const data = {
        name: response.data.check.name,
        uptime_changes: [
          {
            id: "1",
            uptime: 100,
            from: "2021-09-18T00:00:00Z",
            to: "2021-09-18T23:59:59Z",
            duration: 86400,
          },
          {
            id: "2",
            uptime: 100,
            from: "2021-09-19T00:00:00Z",
            to: "2021-09-19T23:59:59Z",
            duration: 86400,
          },
        ],
        test_logs: [
          {
            id: 1,
            timestamp: "2021-09-18T00:00:00Z",
            time_relative: 0,
            status: "up",
            response_time: 100,
            location: "us-west-1",
          },
          {
            id: 2,
            timestamp: "2021-09-18T01:00:00Z",
            time_relative: 60,
            status: "down",
            response_time: 200,
            location: "us-east-1",
          },
          {
            id: 3,
            timestamp: "2021-09-18T02:00:00Z",
            time_relative: 120,
            status: "up",
            response_time: 150,
            location: "eu-west-1",
          },
          {
            id: 4,
            timestamp: "2021-09-18T03:00:00Z",
            time_relative: 180,
            status: "up",
            response_time: 120,
            location: "ap-south-1",
          },
          {
            id: 5,
            timestamp: "2021-09-18T04:00:00Z",
            time_relative: 240,
            status: "down",
            response_time: 300,
            location: "us-west-2",
          },
          {
            id: 6,
            timestamp: "2021-09-18T05:00:00Z",
            time_relative: 300,
            status: "up",
            response_time: 90,
            location: "us-west-1",
          },
          {
            id: 7,
            timestamp: "2021-09-18T06:00:00Z",
            time_relative: 360,
            status: "down",
            response_time: 250,
            location: "eu-central-1",
          },
        ],
        uptime: 94.3,
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
                checkDetails?.test_logs?.map((log) => ({
                  id: log.id,
                  time: log.timestamp,
                  up: log.status === "up",
                  time_relative: log.time_relative,
                  response_time: log.response_time,
                  location: log.location,
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
