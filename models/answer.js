const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Answer = sequelize.define('Answer', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  emotion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.TIME,
  },
}, {
  timestamps: false,
  // Other model options go here
});


module.exports = Answer;