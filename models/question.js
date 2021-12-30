const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Answer = require('./answer');


const Question = sequelize.define('Question', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  person: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emotion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  intensity: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  timestamps: false,
  // Other model options go here
});

Question.hasOne(Answer, {onDelete: 'cascade'});
Answer.belongsTo(Question,{onDelete: 'cascade'});


module.exports = Question;