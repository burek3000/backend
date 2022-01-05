var express = require('express');
var router = express.Router();
const fs = require('fs');
const checkAuth = require('../auth/check-auth');
const Answer = require('../models/answer');
const Question = require('../models/question');
const Test = require('../models/test');

router.get('/imageNames', checkAuth, async (req, res) => {

    try {

        const fs = require("fs");
        var randomImages = [];
        while (randomImages.length != 10) {
            var randomImage;
            var personId = Math.floor(Math.random() * (45)) + 1;

            if (personId < 10) {
                personId = '0' + personId
            };

            var gender = [
                'M',
                'F'
            ];
            var randomGender = gender[getRandomIndex(gender)];

            var emotions = [
                'FE',
                'HA',
                'SA',
                'DI',
                'AN',
                'SP'
            ];
            var randomEmotion = emotions[getRandomIndex(emotions)];

            var intensities = [
                'O',
                'C',
                'X'
            ];
            var randomIntensity = intensities[getRandomIndex(intensities)];

            randomImage = personId + randomGender + "_" + randomEmotion + "_" + randomIntensity;

            if (fs.existsSync('public/images/' + randomImage + '.JPG')) {
                randomImages.push(randomImage);
            }
        }

        res.json({
            randomImages
        });
    }
    catch (err) {
        return res.status(500).json({
            error: err,
            message: 'Cannot fetch image urls..',
        });
    }
    function getRandomIndex(array) {
        return Math.floor(Math.random() * array.length);
    }


});

router.post('/saveResults', checkAuth, async (req, res) => {

    try {
        console.log(req.body);
        console.log(req.userData);

        const { id } = req.userData;

        const startTime = new Date(Date.parse(req.body.startTime)); // daje za 1 sat krivo !!! popraviti !!
        startTime.setTime(startTime.getTime() - new Date().getTimezoneOffset() * 60 * 1000);
        const endTime = new Date(Date.parse(req.body.endTime));
        endTime.setTime(endTime.getTime() - new Date().getTimezoneOffset() * 60 * 1000);

        var seconds = 0
        var minutes = 0;
        var hours = 0

        seconds = (endTime - startTime) / 1000;

        console.log("u sekundama: " + seconds)

        if (seconds >= 60) {
            minutes = Math.floor(seconds / 60);
            seconds = seconds % 60

            if (minutes >= 60) {
                hours = Math.floor(minutes / 60);
                minutes = minutes % 60;
            }
        }

        const duration = hours + ':' + minutes + ":" + seconds;

        console.log("Trajanje  je " + duration);


        const newTest = await Test.create({ startTime: startTime, endTime: endTime, duration: duration, UserId: id });

        console.log(newTest.id)

        const questions = req.body.questions;
        const answers = req.body.answers;


        for (var i = 0; i < 10; i++) {
            const properties = questions[i].split("_")
            const person = properties[0].charAt(0) + properties[0].charAt(1);
            const gender = properties[0].charAt(2);
            const emotion = properties[1];
            const intensity = properties[2];
            const newQuestion = await Question.create({ person: person, gender: gender, emotion: emotion, intensity: intensity, TestId: newTest.id });
            await Answer.create({ emotion: answers[i], QuestionId: newQuestion.id });
        }

        return res.status(200).json({
            message: "Rezultati su pohranjeni !",
        });
    }

    catch (err) {
        console.log(err);
        return res.status(400).json({
            message: "Greška ! Rezultati nisu pohranjeni !",
        });
    }

});

router.get("/results", checkAuth, async (req, res) => {

    try {
        const { id } = req.userData;
        const users = await Test.findAll({
            include: [
                {
                    model: User,
                    where: {
                        UserId: id
                    }
                }
            ]
        });

        return res.status(200).json({ users: users })
    }

    catch (err) {
        console.log(err);
        return res.status(400).json({
            message: "Greška ! Ne mogu dohvatiti korisnike i rezultate testa !",
        });
    }

});


router.post("/delete", checkAuth, async (req, res) => {
    try {

        await Test.destroy({
            where: {
                id: req.body
            }
        });

        return res.status(200).json({ message: "Označeni testovi su obrisani" })
    }

    catch (err) {
        console.log(err);
        return res.status(400).json({
            message: "Greška ! Ne mogu obrisati testove!",
        });
    }

});

router.get("/:testId/answers", checkAuth, async (req, res) => {
    try {

        const id = req.params.testId;

        console.log("Id testa je " + id);


        const answers = await Question.findAll({
            where: {
                TestId: id
            },
            include: [
                {
                    model: Answer
                }
            ]
        });

        return res.status(200).json({ answers: answers })
    }

    catch (err) {
        console.log(err);
        return res.status(400).json({
            message: "Greška ! Ne mogu dohvatiti rezultat testa!",
        });
    }

});

module.exports = router;