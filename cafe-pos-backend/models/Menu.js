// models/Menu.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Menu = sequelize.define("Menu", {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  barcode: { type: DataTypes.STRING, allowNull: true, unique: true},
  image: { type: DataTypes.STRING, allowNull: true},
  discount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0},
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = Menu;