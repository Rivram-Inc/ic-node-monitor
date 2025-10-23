"use client";
import React from "react";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface NodeRewardsDetailTableProps {
  metrics: any[];
  loading?: boolean;
}

// Format numbers compactly
const fmt = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString(undefined, { maximumFractionDigits: 1 });
};

const NodeRewardsDetailTable: React.FC<NodeRewardsDetailTableProps> = ({
  metrics,
  loading = false,
}) => {
  const hasNoData = !metrics || metrics.length === 0;

  if (loading) {
    return (
      <div className="w-full animate-pulse space-y-2">
        <div className="h-10 bg-gray-200 rounded"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded"></div>
        ))}
      </div>
    );
  }

  if (hasNoData) {
    return (
      <div className="w-full p-8 bg-white border border-gray-200 rounded-xl shadow-sm text-center">
        <h3 className="text-sm font-medium text-gray-700 mb-1">
          No Daily Rewards Data
        </h3>
        <p className="text-xs text-gray-500">
          No detailed reward history found for this node.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">Daily Rewards History</h3>
        <p className="text-sm text-gray-600 mt-1">
          Detailed breakdown of daily rewards and performance
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                <TableHead className="text-sm font-semibold text-gray-700">Date</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700">Status</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700 text-right">Base XDR</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700 text-right">Earned XDR</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700 text-right">Multiplier</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700 text-right">Reduction</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700 text-right">Blocks</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700 text-right">FR %</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700">Subnet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric, index) => (
                <TableRow
                  key={`${metric.day_utc}-${index}`}
                  className="hover:bg-blue-50/50 transition-colors"
                >
                  <TableCell className="text-sm text-gray-700">
                    {moment(metric.day_utc).format("MMM DD, YYYY")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        metric.node_status === "Assigned"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {metric.node_status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-right text-gray-700">
                    {fmt(Number.parseFloat(metric.base_rewards_xdr) || 0)}
                  </TableCell>
                  <TableCell className="text-sm text-right font-semibold text-gray-900">
                    {fmt(Number.parseFloat(metric.adjusted_rewards_xdr) || 0)}
                  </TableCell>
                  <TableCell className="text-sm text-right text-gray-700">
                    {metric.performance_multiplier
                      ? Number.parseFloat(metric.performance_multiplier).toFixed(2)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-right">
                    <span
                      className={
                        Number.parseFloat(metric.rewards_reduction || 0) > 0
                          ? "text-red-600 font-semibold"
                          : "text-gray-600"
                      }
                    >
                      {Number.parseFloat(metric.rewards_reduction || 0).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-right">
                    <span className="text-red-600 font-medium">
                      {metric.num_blocks_failed || 0}
                    </span>
                    <span className="text-gray-400"> / </span>
                    <span className="text-gray-700">{metric.num_blocks_proposed || 0}</span>
                  </TableCell>
                  <TableCell className="text-sm text-right text-gray-700">
                    {metric.daily_failure_rate
                      ? `${(Number.parseFloat(metric.daily_failure_rate) * 100).toFixed(2)}%`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600" title={metric.subnet_assigned || ""}>
                    {metric.subnet_assigned
                      ? `${metric.subnet_assigned.substring(0, 8)}...`
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default NodeRewardsDetailTable;

