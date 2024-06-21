"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader } from "lucide-react";

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
      // const response = await fetch(`/api/checks/${checkID}`);
      // const data = await response.json();
      const data = {
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
        uptime: 100,
        downtime: 0,
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
    <div>
      <h1>Check Report</h1>
    </div>
  );
};

export default CheckReport;
