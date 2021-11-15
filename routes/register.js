const bcrypt = require('bcryptjs');

const express = require('express');
const User = require('../models/user');

const router = express.Router();

router.post("/register", async (req, res) => {
    console.log(req.body)

    const { fullname, username, password } = req.body;

    const existingUser = await User.findOne({ where: { username } }).catch(
        (err) => {
            console.log(err);
            return res.status(500).json({
                message: "Cannot register user atm!"
            });
        }
    );

    if (existingUser) {
        return res.status(400).json({ message: "User already exists!" })
    }

    const hash = await bcrypt.hash(password, 10);
    await new User({ fullname, username, password : hash }).save().catch((err) => {
        console.log(err);
        return res.status(500).json({
            message: "Cannot register user atm!"
        });
    });

    return res.status(200).json({ message: "User registered!" })
});

module.exports = router;