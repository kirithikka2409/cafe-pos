const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Cart = sequelize.define("Cart",
  {
    userId: {
      type: DataTypes.INTEGER,
    allowNull: false,
    },
    items: 
      {
           type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
      },
    }
);

module.exports = Cart;