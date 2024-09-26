"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Hexagon, Share2 } from "lucide-react";

const DashboardHeader = () => {
  const router = useRouter();

  return (
    <div className="flex bg-white shadow-sm p-4 px-8 border-b-2 top-0 sticky z-10 w-full">
      <div className="flex w-full justify-between items-center">
        <h1
          className="text-2xl font-bold cursor-pointer flex justify-start px-4 whitespace-nowrap items-center"
          onClick={() => router.push("/")}
        >
          IC Node Monitoring
        </h1>
        <div className="w-full flex justify-end items-center ml-auto pl-auto">
          <button
            type="button"
            className="text-gray-900 bg-blue-50 hover:bg-blue-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2 transition-all ease-in-out duration-200"
            onClick={() => router.push("/app/node_providers")}
          >
            <Share2 size={16} className="me-2" />
            Node Providers
          </button>
          <button
            type="button"
            className="text-gray-900 bg-blue-50 hover:bg-blue-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2 transition-all ease-in-out duration-200"
            onClick={() => router.push("/app/nodes")}
          >
            <Hexagon size={16} className="me-2" />
            Nodes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
