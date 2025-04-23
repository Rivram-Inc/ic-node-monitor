"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Hexagon, Share2 } from "lucide-react";
import { motion } from "framer-motion";

const DashboardHeader = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Check if the current route matches the button's route
  const isNodeProvidersActive = pathname.startsWith("/app/node_providers");
  const isNodesActive = pathname.startsWith("/app/nodes");

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex bg-white shadow-sm p-4 px-0 md:px-8 border-b-2 top-0 sticky z-10 w-full"
    >
      <div className="flex w-full justify-between items-center">
        {/* Logo/Title */}
        <h1
          className="md:text-2xl text-lg font-bold cursor-pointer flex justify-start px-4 whitespace-nowrap items-center text-slate-700 hover:text-slate-900 transition-all ease-in-out duration-200"
          onClick={() => router.push("/")}
        >
          IC Node Monitoring
        </h1>

        {/* Buttons */}
        <div className="w-full flex justify-end items-center ml-auto pl-auto pr-4 md:pr-0 gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className={`text-sm px-4 py-2.5 text-center inline-flex items-center rounded-lg transition-all ease-in-out duration-200 ${
              isNodeProvidersActive
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-50 text-gray-900 hover:bg-blue-100"
            }`}
            onClick={() => router.push("/app/node_providers")}
          >
            <Share2 size={16} className="me-2" />
            <span className="hidden md:flex">Node Providers</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className={`text-sm px-4 py-2.5 text-center inline-flex items-center rounded-lg transition-all ease-in-out duration-200 ${
              isNodesActive
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-50 text-gray-900 hover:bg-blue-100"
            }`}
            onClick={() => router.push("/app/nodes")}
          >
            <Hexagon size={16} className="me-2" />
            <span className="hidden md:flex">Nodes</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
