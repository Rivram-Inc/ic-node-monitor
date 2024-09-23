import db from "../config/database";

import Nodes from "./Nodes";
import PingResults from "./PingResults";
import OneHourIpAddresses from "./MaterializedViews/OneHourIPAddresses";
import TwentyFourHoursIpAddresses from "./MaterializedViews/TwentyFourHoursIPAddresses";
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
  ThirtyDaysIpAddresses,
};

export default authenticateDB;
