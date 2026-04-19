const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("posdb", "root", "1724", {
  host: "localhost",
  dialect: "mysql", // or "postgres"
});

sequelize
  .authenticate()
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB connection failed:", err));

module.exports = sequelize;