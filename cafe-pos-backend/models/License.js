const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const License = sequelize.define("License", {
  clientName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  licenseKey: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
    days: { 
        type: DataTypes.INTEGER 
    },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  activatedAt: { 
    type: DataTypes.DATE, allowNull: true 
},
isActivated: { 
    type: DataTypes.BOOLEAN, defaultValue: false 

},

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, 

{
  timestamps: true
});

module.exports = License;