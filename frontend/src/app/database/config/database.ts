import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import pg from "pg";

pg.defaults.parseInt8 = true;

dotenv.config();

const connection = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASS as string,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string, 10),
    dialect: "postgres",
    dialectModule: pg, // I've added this.
    logging: false,
    pool: {
      max: 20,
      min: 1,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: true,
      freezeTableName: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export default connection;
