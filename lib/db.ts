import { Sequelize } from "sequelize"

const sequelize = new Sequelize({
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "stock_market",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "password",
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
})

export default sequelize
