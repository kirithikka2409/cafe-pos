const { DataTypes } = require("sequelize");
const db = require("../config/db");


const Order = db.define("Order", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  staffId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  items: {
    type: DataTypes.JSON,
    allowNull: false,
  },

  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  discount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },

  vat: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },

  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "pending", // pending / preparing / ready / delivered / cancelled
  },

  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: "unpaid", // unpaid / paid
  },

  cancelReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  orderType: {
    type: DataTypes.STRING,
    defaultValue: "take-away",
  },

  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
});

module.exports = Order;