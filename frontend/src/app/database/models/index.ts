import db from "../config/database";

import Nodes from "./Nodes";
import PingResults from "./PingResults";
import OneHourIpAddresses from "./MaterializedViews/OneHourIPAddresses";
import TwentyFourHoursIpAddresses from "./MaterializedViews/TwentyFourHoursIPAddresses";
import SevenDaysIpAddresses from "./MaterializedViews/SevenDaysIPAddresses";
import ThirtyDaysIpAddresses from "./MaterializedViews/ThirtyDaysIPAddresses";

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
};

export default authenticateDB;
