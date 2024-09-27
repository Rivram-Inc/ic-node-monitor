import { DataTypes } from "sequelize";
import db from "../config/database";

const DataCenters = db.define(
  "data_centers",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    dc_key: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dc_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(9, 6), // Allows for precision for latitude
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(9, 6), // Allows for precision for latitude
      allowNull: true,
    },
    node_providers: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    owner: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    region: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    total_nodes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
    tableName: "data_centers", // Explicit table name to match the database
  }
);

export default DataCenters;
