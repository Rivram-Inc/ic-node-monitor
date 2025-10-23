import { DataTypes } from "sequelize";
import db from "../config/database";

const NodeProviderDailySummary = db.define(
  "node_provider_daily_summary",
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
    // Counts
    total_nodes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    assigned_nodes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    unassigned_nodes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Rewards
    expected_rewards_xdr_permyriad: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    actual_rewards_xdr_permyriad: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    total_reduction_xdr_permyriad: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    // Block Performance
    total_blocks_proposed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_blocks_failed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_failure_rate: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    // Underperforming
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
    timestamps: true,
    underscored: true,
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

export default NodeProviderDailySummary;


