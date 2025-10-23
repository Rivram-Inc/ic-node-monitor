import { DataTypes } from "sequelize";
import db from "../config/database";

const BaseRewards = db.define(
  "base_rewards",
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
    monthly_xdr_permyriad: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    daily_xdr_permyriad: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    node_reward_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    region: {
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

export default BaseRewards;


