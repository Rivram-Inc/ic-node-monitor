import { DataTypes } from "sequelize";
import db from "../config/database";

const XdrIcpConversionRate = db.define(
  "xdr_icp_conversion_rates",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    day_utc: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
    },
    xdr_to_usd: {
      type: DataTypes.DECIMAL(18, 10),
      allowNull: true,
    },
    icp_to_usd: {
      type: DataTypes.DECIMAL(18, 10),
      allowNull: true,
    },
    xdr_to_icp: {
      type: DataTypes.DECIMAL(18, 10),
      allowNull: true,
    },
    source: {
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
        fields: ["day_utc"],
      },
    ],
  }
);

export default XdrIcpConversionRate;


