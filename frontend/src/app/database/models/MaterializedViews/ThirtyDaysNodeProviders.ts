import { DataTypes } from "sequelize";
import db from "../../config/database";

const ThirtyDaysNodeProviders = db.define(
  "thirty_days_node_providers",
  {
    bucket: {
      type: DataTypes.DATE,
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
    node_provider_total_packets_sent: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    node_provider_total_packets_received: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    node_provider_avg_avg_rtt: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    node_provider_avg_packet_loss: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    node_provider_min_avg_rtt: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    node_provider_max_avg_rtt: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    node_provider_min_packet_loss: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    node_provider_max_packet_loss: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    createdAt: false, // Disable createdAt and updatedAt since it's a view
    updatedAt: false,
    freezeTableName: true, // Prevent Sequelize from pluralizing table names
  }
);

export default ThirtyDaysNodeProviders;
