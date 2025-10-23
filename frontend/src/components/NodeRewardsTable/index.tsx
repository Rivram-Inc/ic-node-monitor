"use client";
import React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface NodeReward {
  node_id: string;
  day_utc: string;
  base_rewards_xdr: number;
  adjusted_rewards_xdr: number;
  adjusted_rewards_icp?: number;
  relative_fr: number;
  performance_multiplier: number;
  rewards_reduction: number;
  node_status: string;
}

interface NodeRewardsTableProps {
  rewards: NodeReward[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

// Format numbers compactly
const fmt = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString(undefined, { maximumFractionDigits: 1 });
};

// Get attainment badge color
const getAttainmentClass = (attainment: number): string => {
  if (attainment >= 90) return "bg-green-100 text-green-700";
  if (attainment >= 70) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

const NodeRewardsTable: React.FC<NodeRewardsTableProps> = ({
  rewards,
  loading = false,
  pagination,
  onNextPage,
  onPrevPage,
}) => {
  const calcAttainment = (adj: number | string, base: number | string): number => {
    const adjNum = Number.parseFloat(adj as string) || 0;
    const baseNum = Number.parseFloat(base as string) || 0;
    return baseNum === 0 ? 0 : (adjNum / baseNum) * 100;
  };

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

  if (!rewards || rewards.length === 0) {
    return (
      <div className="w-full p-8 bg-white border border-gray-200 rounded-xl shadow-sm text-center">
        <p className="text-sm text-gray-500">No rewards data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                <TableHead className="text-sm font-semibold text-gray-700">Date</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700">Node ID</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700">Status</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700 text-right">Base XDR</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700 text-right">Rel. FR</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700 text-right">Multiplier</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700 text-right">XDR Earned</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700 text-right">ICP Earned</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700 text-right">Reduction</TableHead>
                <TableHead className="text-sm font-semibold text-gray-700 text-right">Attainment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.map((reward, index) => {
                const attainment = calcAttainment(
                  reward.adjusted_rewards_xdr,
                  reward.base_rewards_xdr
                );
                const icpEarned = Number.parseFloat(reward.adjusted_rewards_icp as any) || 0;

                return (
                  <TableRow
                    key={`${reward.node_id}-${reward.day_utc}-${index}`}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <TableCell className="text-sm text-gray-700">
                      {reward.day_utc}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/app/nodes/${reward.node_id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        title={reward.node_id}
                      >
                        {reward.node_id.substring(0, 10)}...
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          reward.node_status === "Assigned"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {reward.node_status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-right text-gray-700">
                      {fmt(Number(reward.base_rewards_xdr) || 0)}
                    </TableCell>
                    <TableCell className="text-sm text-right text-gray-700">
                      {reward.relative_fr
                        ? (Number(reward.relative_fr) * 100).toFixed(2) + "%"
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-right text-gray-700">
                      {reward.performance_multiplier
                        ? Number(reward.performance_multiplier).toFixed(2)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-right font-semibold text-gray-900">
                      {fmt(Number(reward.adjusted_rewards_xdr) || 0)}
                    </TableCell>
                    <TableCell className="text-sm text-right font-semibold text-green-700">
                      {fmt(Number(icpEarned) || 0)}
                    </TableCell>
                    <TableCell className="text-sm text-right">
                      <span
                        className={
                          Number(reward.rewards_reduction || 0) > 0
                            ? "text-red-600 font-semibold"
                            : "text-gray-600"
                        }
                      >
                        {Number(reward.rewards_reduction || 0).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-right">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded ${getAttainmentClass(attainment)}`}
                      >
                        {attainment.toFixed(0)}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
            </div>
            <div className="flex gap-2">
              <button
                onClick={onPrevPage}
                disabled={!pagination.hasPrev}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={onNextPage}
                disabled={!pagination.hasNext}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeRewardsTable;

