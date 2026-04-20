const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const License = sequelize.define("License", {
  clientName: {
    type: DataTypes.STRING,
    allowNull: false
  },

  licenseKey: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },

  days: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },

  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },

  activatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },

  isActivated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

module.exports = License;