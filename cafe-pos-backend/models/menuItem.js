const { DataTypes } = require("sequelize");
const db = require("../config/db");

const MenuItem = db.define("MenuItem", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  image: { 
    type: DataTypes.STRING, 
    allowNull: true
  },

  discount: {
    type: DataTypes.FLOAT,
    allowNull: true
  },

   foodType: { 
    type: DataTypes.ENUM("Veg", "Non-Veg", "Egg"), 
    allowNull: false, 
    defaultValue: "Veg" 
  },
});

module.exports = MenuItem;