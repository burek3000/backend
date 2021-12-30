
const express = require('express');
const checkAuth = require('../auth/check-auth');
const User = require('../models/user');
const Test = require('../models/test');


const router = express.Router();

router.get("/info", checkAuth, async (req, res) => {
  const { id } = req.userData;
  const user = await User.findOne({ where: { id } }).catch(
    (err) => {
      console.log(err);
    }
  );

  if (user) {
    return res.json(user);
  } else {
    return res.status(404).json({
      message: "User not found",
    });
  }

});

module.exports = router;