"use client";
import React from "react";
import moment from "moment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NodeRewardsSummaryCardProps {
  nodeId: string;
  rewardsData: {
    summary: {
      days_assigned: number;
      days_unassigned: number;
      avg_reward_multiplier: number;
      total_blocks_proposed: number;
      total_blocks_failed: number;
      avg_failure_rate: number;
      base_monthly_rewards_xdr: number;
      total_rewards_xdr: number;
    };
    period: {
      startDate: string;
      endDate: string;
      totalDays: number;
    };
  } | null;
  loading?: boolean;
  days?: number;
  onDaysChange?: (days: number) => void;
}

// Helper to format numbers
const formatNum = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const StatBox = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div
    className={`p-3 rounded-lg border transition-all ${
      highlight
        ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
        : "bg-white border-gray-200 hover:border-gray-300"
    }`}
  >
    <p className="text-xs font-medium text-gray-600 mb-1 truncate">{label}</p>
    <p
      className={`text-base font-bold truncate ${
        highlight ? "text-green-700" : "text-gray-900"
      }`}
      title={value}
    >
      {value}
    </p>
  </div>
);

const NodeRewardsSummaryCard: React.FC<NodeRewardsSummaryCardProps> = ({
  nodeId,
  rewardsData,
  loading = false,
  days = 30,
  onDaysChange,
}) => {
  const { summary, period } = rewardsData || { summary: null, period: null };
  const avgFailureRatePercent = (summary?.avg_failure_rate || 0) * 100;
  const rewardAttainment =
    summary && summary.base_monthly_rewards_xdr > 0
      ? (summary.total_rewards_xdr / summary.base_monthly_rewards_xdr) * 100
      : 0;

  return (
    <div className="w-full p-5 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-gray-900">
            Rewards Summary
          </h2>
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-xs text-gray-600">
                {period?.startDate && period?.endDate
                  ? `${moment(period.startDate).format("MMM DD")} - ${moment(period.endDate).format("MMM DD")}`
                  : "-"}
              </p>
            )}
            {onDaysChange && (
              <Select
                value={String(days)}
                onValueChange={(value) => onDaysChange(Number(value))}
                disabled={loading}
              >
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-gray-200">
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        )}
        {!loading && !summary && (
          <div className="text-center py-8 text-sm text-gray-500">
            No rewards data available
          </div>
        )}
        {!loading && summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBox
              label="XDR Earned"
              value={formatNum(summary.total_rewards_xdr)}
              highlight={true}
            />
            <StatBox
              label="Attainment"
              value={`${rewardAttainment.toFixed(1)}%`}
            />
            <StatBox
              label="Days Assigned"
              value={`${summary.days_assigned || 0}/${period?.totalDays || 0}`}
            />
            <StatBox
              label="Failure Rate"
              value={`${avgFailureRatePercent.toFixed(3)}%`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeRewardsSummaryCard;

