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
        const endTime = new Date(Date.parse(req.body.endTime));

        const newTest = await Test.create({ startTime: startTime, endTime: endTime, UserId: id });

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

module.exports = router;