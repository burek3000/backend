const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Question = require('./question');

const Test = sequelize.define('Test', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
}, {
  timestamps: false,
  // Other model options go here
});

Test.hasMany(Question);
Question.belongsTo(Test);


module.exports = Test;