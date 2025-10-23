import { DataTypes } from "sequelize";
import db from "../config/database";

const NodeRewardsSummary = db.define(
  "node_rewards_summary",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    node_provider_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    day_utc: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    rewards_total_xdr_permyriad: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    nodes_in_registry: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    assigned_nodes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    underperforming_nodes_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    underperforming_nodes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["node_provider_id", "day_utc"],
      },
      {
        fields: ["node_provider_id"],
      },
      {
        fields: ["day_utc"],
      },
    ],
  }
);

export default NodeRewardsSummary;


