import { DataTypes } from "sequelize";
import db from "../config/database";

const NodeRewardMetrics = db.define(
  "node_reward_metrics",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    node_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    node_provider_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    day_utc: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    node_reward_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    region: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dc_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    node_status: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    performance_multiplier: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    rewards_reduction: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    base_rewards_xdr_permyriad: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    adjusted_rewards_xdr_permyriad: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    subnet_assigned: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subnet_assigned_fr: {
      type: DataTypes.DECIMAL(30, 28),
      allowNull: true,
    },
    num_blocks_proposed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    num_blocks_failed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    daily_failure_rate: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    original_fr: {
      type: DataTypes.DECIMAL(30, 28),
      allowNull: true,
    },
    relative_fr: {
      type: DataTypes.DECIMAL(30, 28),
      allowNull: true,
    },
    extrapolated_fr: {
      type: DataTypes.DECIMAL(30, 28),
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["node_id", "day_utc"],
      },
      {
        fields: ["node_id"],
      },
      {
        fields: ["node_provider_id"],
      },
      {
        fields: ["day_utc"],
      },
      {
        fields: ["node_status"],
      },
      {
        fields: ["node_provider_id", "day_utc"],
      },
    ],
  }
);

export default NodeRewardMetrics;

