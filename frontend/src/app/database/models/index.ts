import db from "../config/database";

import Nodes from "./Nodes";
import PingResults from "./PingResults";
import OneHourIpAddresses from "./MaterializedViews/OneHourIPAddresses";
import TwentyFourHoursIpAddresses from "./MaterializedViews/TwentyFourHoursIPAddresses";
import SevenDaysIpAddresses from "./MaterializedViews/SevenDaysIPAddresses";
import ThirtyDaysIpAddresses from "./MaterializedViews/ThirtyDaysIPAddresses";
import ThirtyDaysNodeProviders from "./MaterializedViews/ThirtyDaysNodeProviders";
import DataCenters from "./DataCenters";
import NodeRewardMetrics from "./NodeRewardMetrics";
import NodeRewardsSummary from "./NodeRewardsSummary";
import BaseRewards from "./BaseRewards";
import NodeProviderDailySummary from "./NodeProviderDailySummary";
import XdrIcpConversionRate from "./XdrIcpConversionRate";

const authenticateDB = async () => {
  // define associations here

  await db.authenticate();
  console.log("Database connected");
};

export {
  Nodes,
  DataCenters,
  PingResults,
  OneHourIpAddresses,
  TwentyFourHoursIpAddresses,
  SevenDaysIpAddresses,
  ThirtyDaysIpAddresses,
  ThirtyDaysNodeProviders,
  NodeRewardMetrics,
  NodeRewardsSummary,
  BaseRewards,
  NodeProviderDailySummary,
  XdrIcpConversionRate,
};

export default authenticateDB;
