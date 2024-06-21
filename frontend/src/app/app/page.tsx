"use client";
import React, { useEffect, useState } from "react";
import ChecksListTable from "@/components/ChecksListTable";
import Loader from "@/components/Loader";
import axios from "axios";

const App = () => {
  const [fetching, setFetching] = useState(true);
  const [checks, setChecks] = useState([]);

  useEffect(() => {
    fetchChecks();
  }, []);

  const fetchChecks = async () => {
    try {
      setFetching(true);
      const response = await axios.get("/api/pingdom/checks");
      setChecks(
        response.data?.checks?.map((check: any) => ({
          id: check.id,
          site_name: check.name,
          tags: check.tags || [],
          type: check.type?.toUpperCase(),
          uptime: check.uptime || 100,
          up_since: check.upsince,
          response_time: check.lastresponsetime,
        })) || []
      );
      setFetching(false);
    } catch (error) {
      console.error(error);
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
    <div className="flex w-full">
      <ChecksListTable checks={checks} />
    </div>
  );
};

export default App;
