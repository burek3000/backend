const express = require('express');
const User = require('../models/user');
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", async (req, res) => {

    const { username, password } = req.body;

    const existingUser = await User.findOne({ where: { username } }).catch(
        (err) => {
            console.log(err);
        }
    );

    if (!existingUser) {
        return res.status(400).json({ message: "Email or password does not match!" })
    }

    if (existingUser.password !== password) {
        return res.status(400).json({ message: "Email or password does not match!" })
    }

    const jwtToken = jwt.sign({ id: existingUser.id, username: existingUser.username }, process.env.JWT_KEY);

    res.status(200).json({ message: "Autentification successful", token: jwtToken })
});

module.exports = router;