import db from "../config/database";

import Nodes from "./Nodes";
import PingResults from "./PingResults";
import OneHourIpAddresses from "./MaterializedViews/OneHourIPAddresses";
import TwentyFourHoursIpAddresses from "./MaterializedViews/TwentyFourHoursIPAddresses";
import SevenDaysIpAddresses from "./MaterializedViews/SevenDaysIPAddresses";
import ThirtyDaysIpAddresses from "./MaterializedViews/ThirtyDaysIPAddresses";
import ThirtyDaysNodeProviders from "./MaterializedViews/ThirtyDaysNodeProviders";

const authenticateDB = async () => {
  // define associations here

  await db.authenticate();
  console.log("Database connected");
};

export {
  Nodes,
  PingResults,
  OneHourIpAddresses,
  TwentyFourHoursIpAddresses,
  SevenDaysIpAddresses,
  ThirtyDaysIpAddresses,
  ThirtyDaysNodeProviders,
};

export default authenticateDB;
