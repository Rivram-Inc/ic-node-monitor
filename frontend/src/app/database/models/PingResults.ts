import { DataTypes } from "sequelize";
import db from "../config/database";

const PingResults = db.define(
  "ping_results",
  {
    ip_address: {
      type: DataTypes.INET,
      primaryKey: true,
    },
    avg_rtt: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    packets_sent: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    packets_received: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    packet_loss: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    ping_at_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

export default PingResults;
