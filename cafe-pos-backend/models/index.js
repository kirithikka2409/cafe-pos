const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const MenuItem = require("./MenuItem")(sequelize, DataTypes);
const Order = require("./Order")(sequelize, DataTypes);
const Staff = require("./Staff")(sequelize, DataTypes);

// ---------------- ASSOCIATIONS ----------------
Order.belongsTo(Staff, { foreignKey: "staffId", as: "staff" });
Staff.hasMany(Order, { foreignKey: "staffId", as: "orders" });

// ---------------- EXPORT ----------------
module.exports = {
  sequelize,
  MenuItem,
  Order,
  Staff,
};