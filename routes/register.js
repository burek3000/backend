const bcrypt = require('bcryptjs');

const express = require('express');
const checkAuth = require('../auth/check-auth');
const User = require('../models/user');

const router = express.Router();

router.post("/register", checkAuth, async (req, res) => {
    try {

        const { id } = req.userData;

        console.log(req.body)

        const { fullname, username, password, role, age, gender } = req.body;

        const existingUser = await User.findOne({ where: { username } })

        if (existingUser) {
            return res.status(400).json({ message: "Greška! Korisnik već registriran!" })
        }

        const hash = await bcrypt.hash(password, 10);

        if (role == 'expert') {
            await User.create({ fullname, username, password: hash, role: role, age: age, gender: gender })
        }

        else if (role == 'user') {
            await User.create({ fullname, username, password: hash, role: role, UserId: id, age: age, gender: gender })
        }

        return res.status(200).json({ message: "Korisnik registriran!" })
    }

    catch (err) {
        console.log(err);
        return res.status(400).json({
            message: "Greška ! Korisnik nije registriran",
        });
    }

});

module.exports = router;