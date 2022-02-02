const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')

require('dotenv').config();

const indexRouter = require('./routes/index');
const registerRouter = require('./routes/register')
const loginRouter = require('./routes/login')
const userRouter = require('./routes/user')
const testRouter = require('./routes/test')

const app = express();
app.use(cors());
const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');

try {
  sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

User = require('./models/user');
Test = require('./models/test');
Question = require('./models/question');
Answer = require('./models/answer');

User.sync({ force: false }).then(() => {
  console.log("User is synchronized successfully");
});
Test.sync({ force: false }).then(() => {
  console.log("Test is synchronized successfully");
});
Question.sync({ force: false }).then(() => {
  console.log(" is synchronized successfully");
});
Answer.sync({ force: false }).then(() => {
  console.log("Answer is synchronized successfully");
});


app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', registerRouter);
app.use('/', loginRouter);
app.use('/user', userRouter);
app.use('/test', testRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  res.status(err.status || 500).json({
    error: {
      message: err.message
    }
  });

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
});

app.listen(process.env.PORT, () => {
  console.log("Server started on port " + process.env.PORT);
})
