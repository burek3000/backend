const passport = require("passport");
const passportJwt = require("passport-jwt");
const User = require('../models/user');


const ExtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy

//function for validating jwt, after login, when you try to visit
//something that demands autentification
//checks if you have proper data and secret key it lets you pass
passport.use(
    new StrategyJwt(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_KEY,
      },
      function (jwtPayload, done) {
        return User.findOne({ where: { id: jwtPayload.id } })
          .then((user) => {
            return done(null, user);
          })
          .catch((err) => {
            return done(err);
          });
      }
    )
  );