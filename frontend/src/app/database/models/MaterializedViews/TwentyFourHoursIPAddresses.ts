import { DataTypes } from "sequelize";
import db from "../../config/database";

const TwentyFourHoursIpAddresses = db.define(
  "twentyfour_hours_ip_addresses",
  {
    bucket: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: false,
    },
    ping_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ip_address_packets_sent: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    ip_address_packets_received: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    ip_address_avg_avg_rtt: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    ip_address_avg_packet_loss: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    ip_address_min_avg_rtt: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    ip_address_max_avg_rtt: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    ip_address_min_packet_loss: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    ip_address_max_packet_loss: {
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

export default TwentyFourHoursIpAddresses;
