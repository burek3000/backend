const express = require('express');
const bcrypt = require('bcryptjs');
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
        return res.status(400).json({ message: "Email ili lozinka se ne podudaraju!" })
    }

    const match = await bcrypt.compare(password, existingUser.password);
    if (!match) {
        return res.status(400).json({ message: "Email ili lozinka se ne podudaraju!" })
    }

    const payload = {
        id: existingUser.id,
        username: existingUser.username
    }

    const jwtToken = jwt.sign(payload, process.env.JWT_KEY);

    res.status(200).json({ message: "Autentifikacija uspješna!", token: jwtToken })
});

module.exports = router;