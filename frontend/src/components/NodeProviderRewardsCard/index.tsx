"use client";
import React from "react";
import moment from "moment";

interface NodeProviderRewardsCardProps {
  rewardsData: {
    date: string;
    conversion_rate: number;
    icp_price_usd: number;
    expected_rewards_xdr: number;
    expected_rewards_icp: number;
    last_rewards_xdr: number;
    last_rewards_icp: number;
    total_nodes: number;
    assigned_nodes: number;
    unassigned_nodes: number;
  } | null;
  loading?: boolean;
}

// Helper function to format large numbers
const formatNumber = (num: number, decimals: number = 2): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
  });
};

const StatCard = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div
    className={`p-4 rounded-lg border transition-all ${
      highlight
        ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
        : "bg-white border-gray-200 hover:border-gray-300"
    }`}
  >
    <p className="text-xs font-medium text-gray-600 mb-1 truncate">{label}</p>
    <p
      className={`text-lg font-bold truncate ${
        highlight ? "text-blue-700" : "text-gray-900"
      }`}
      title={value}
    >
      {value}
    </p>
  </div>
);

const NodeProviderRewardsCard: React.FC<NodeProviderRewardsCardProps> = ({
  rewardsData,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="w-full p-6 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm animate-pulse">
        <div className="flex flex-col gap-4">
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="p-4 bg-white rounded-lg border border-gray-100">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!rewardsData) {
    return (
      <div className="w-full p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="text-center">
          <p className="text-sm text-gray-500">No rewards data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-900 mb-1">
            Last Rewarding Period
          </h2>
          <p className="text-sm text-gray-600">
            {moment(rewardsData.date).format("ddd, MMM DD YYYY")}
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard
            label="XDR Earned"
            value={formatNumber(rewardsData.last_rewards_xdr)}
            highlight={true}
          />
          <StatCard
            label="ICP Earned"
            value={formatNumber(rewardsData.last_rewards_icp)}
            highlight={true}
          />
          <StatCard
            label="Expected XDR"
            value={formatNumber(rewardsData.expected_rewards_xdr)}
          />
          <StatCard
            label="Expected ICP"
            value={formatNumber(rewardsData.expected_rewards_icp)}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-200">
          <StatCard
            label="Conversion Rate"
            value={rewardsData.conversion_rate?.toFixed(3) || "N/A"}
          />
          <StatCard
            label="ICP Price (USD)"
            value={rewardsData.icp_price_usd ? `$${rewardsData.icp_price_usd.toFixed(2)}` : "N/A"}
          />
          <StatCard
            label="Assigned Nodes"
            value={`${rewardsData.assigned_nodes || 0} / ${rewardsData.total_nodes || 0}`}
          />
          <StatCard
            label="Unassigned"
            value={String(rewardsData.unassigned_nodes || 0)}
          />
        </div>
      </div>
    </div>
  );
};

export default NodeProviderRewardsCard;

