"use client";
import React from "react";
import { useRouter } from "next/navigation";

const DashboardHeader = () => {
  const router = useRouter();

  return (
    <div className="flex w-full bg-white shadow-sm p-4 px-8 border-b-2 top-0 sticky z-10">
      <div className="flex items-center">
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => router.push("/")}
        >
          Dashboard
        </h1>
      </div>
    </div>
  );
};

export default DashboardHeader;
