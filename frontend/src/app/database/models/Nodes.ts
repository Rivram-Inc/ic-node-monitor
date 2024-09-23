import Sequelize, { DataTypes } from "sequelize";
import db from "../config/database";

const Nodes = db.define(
  "nodes",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dc_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dc_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: false,
    },
    node_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    node_operator_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    node_provider_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    node_provider_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    node_type: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    owner: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    region: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    subnet_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

export default Nodes;
