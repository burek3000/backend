var express = require('express');
var router = express.Router();
const fs = require('fs');
const checkAuth = require('../auth/check-auth');
const Answer = require('../models/answer');
const Question = require('../models/question');
const Test = require('../models/test');
const User = require('../models/user');
const excel = require("exceljs");

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
            const model = properties[0].charAt(0) + properties[0].charAt(1);
            const gender = properties[0].charAt(2);
            const emotion = properties[1];
            const intensity = properties[2];
            const newQuestion = await Question.create({ model: model, gender: gender, emotion: emotion, intensity: intensity, TestId: newTest.id });
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

router.get("/:testId/analysis", checkAuth, async (req, res) => {
    try {
        const id = req.params.testId;

        const questions = await Question.findAll({
            where: {
                TestId: id
            },
            include: [
                {
                    model: Answer
                }
            ]
        });

        const happyAll = getAll('HA')
        const happyCorrect = getCorrect('HA')
        const happyPercent = correctPercantage(happyCorrect, happyAll)

        const sadAll = getAll('SA')
        const sadCorrect = getCorrect('SA')
        const sadPercent = correctPercantage(sadCorrect, sadAll)


        const angryAll = getAll('AN')
        const angryCorrect = getCorrect('AN')
        const angryPercent = correctPercantage(angryCorrect, angryAll)


        const supriseAll = getAll('SP')
        const supriseCorrect = getCorrect('SP')
        const suprisePercent = correctPercantage(supriseCorrect, supriseAll)


        const disgustAll = getAll('DI')
        const disgustCorrect = getCorrect('DI')
        const disgustPercent = correctPercantage(disgustCorrect, disgustAll)

        const fearAll = getAll('FE')
        const fearCorrect = getCorrect('FE')
        const fearPercent = correctPercantage(fearCorrect, fearAll)

        const openMouthAll = getAllIntensities('O')
        const openMouthCorrect = getCorrectIntensities('O')
        const openMouthPercent = correctPercantage(openMouthCorrect, openMouthAll)

        const closedMouthAll = getAllIntensities('C')
        const closedMouthCorrect = getCorrectIntensities('C')
        const closedMouthPercent = correctPercantage(closedMouthCorrect, closedMouthAll)

        const openMouthExubiantAll = getAllIntensities('X')
        const openMouthExubiantCorrect = getCorrectIntensities('X')
        const openMouthExubiantPercent = correctPercantage(openMouthExubiantCorrect, openMouthExubiantAll)


        const emotionAnalysis = [{ title: 'Sreća', all: happyAll, percent: happyPercent }, { title: 'Tuga', all: sadAll, percent: sadPercent },
        { title: 'Srdžba', all: angryAll, percent: angryPercent }, { title: 'Iznenađenje', all: supriseAll, percent: suprisePercent },
        { title: 'Gađenje', all: disgustAll, percent: disgustPercent }, { title: 'Strah', all: fearAll, percent: fearPercent }]

        const intensityAnalysis = [{ title: 'Otvorena usta', all: openMouthAll, percent: openMouthPercent }, { title: 'Zatvorena usta', all: closedMouthAll, percent: closedMouthPercent },
        { title: 'Jako otvorena usta', all: openMouthExubiantAll, percent: openMouthExubiantPercent }]


        function getAll(emotion) {
            return questions.filter(q => q.emotion === emotion).length
        }
        function getCorrect(emotion) {
            return questions.filter(q => (q.emotion === emotion && q.emotion === q.Answer.emotion)).length
        }

        function getAllIntensities(intensity) {
            return questions.filter(q => q.intensity === intensity).length
        }
        function getCorrectIntensities(intensity) {
            return questions.filter(q => (q.intensity === intensity && q.emotion === q.Answer.emotion)).length
        }

        function correctPercantage(correct, all) {
            if (all === 0) {
                return 'X'
            }
            return roundToTwo((correct / all) * 100) + '%';
        }

        function roundToTwo(num) {
            return +(Math.round(num + "e+2") + "e-2");
        }

        return res.status(200).json({ emotionAnalysis: emotionAnalysis, intensityAnalysis: intensityAnalysis })
    }

    catch (err) {
        console.log(err);
        return res.status(400).json({
            message: "Greška ! Ne mogu dohvatiti analizu testa!",
        });
    }
});

router.post("/excel", checkAuth, async (req, res) => {

    try {

        const tests = await Test.findAll({
            where: { id: req.body }, include: [
                {
                    model: User
                }
            ]
        });

        const questions = await Question.findAll({
            where: {
                TestId: req.body
            },
            include: [
                {
                    model: Answer
                }
            ]
        })

        let workbook = new excel.Workbook();

        tests.forEach(function (test, index) {

            const sheet = workbook.addWorksheet(index + 1 + '-' + test.User.fullname);

            let startTime = test.startTime;
            let startTimeFormatted = isDigit(startTime.getDate().toString()) + '.' + isDigit((startTime.getMonth() + 1).toString()) + '.' + startTime.getFullYear() + '. '
                + isDigit((startTime.getHours() - 1).toString()) + ':' + isDigit(startTime.getMinutes().toString()) + ':' + isDigit(startTime.getSeconds().toString());

            function isDigit(number) {
                if (number.length === 1) {
                    return '0' + number
                }
                return number
            }


            sheet.mergeCells('A1', 'E2');
            sheet.getCell('A1').value = test.User.fullname + ' ' + startTimeFormatted
            sheet.getRow(4).values = ['Osoba', 'Spol', 'Intenzitet', 'Emocija', 'Odgovor'];

            sheet.columns = [
                { key: 'model' },
                { key: 'gender' },
                { key: 'intensity', width: 20 },
                { key: 'emotion', width: 15 },
                { key: 'answer', width: 15 }

            ]

            questions.forEach(function (item) {
                if (item.TestId === test.id) {
                    sheet.addRow({
                        model: item.model,
                        gender: formatGender(item.gender),
                        intensity: formatIntensity(item.intensity),
                        emotion: formatEmotion(item.emotion),
                        answer: formatEmotion(item.Answer.emotion)
                    })
                }
            })

            function formatGender(gender) {
                if (gender === 'F') {
                    return 'Ž'
                }
                return gender;
            }

            function formatIntensity(intensity) {
                if (intensity === 'O') {
                    return 'Otvorena usta'
                }
                else if (intensity === 'C') {
                    return 'Zatvorena usta'
                }
                else if (intensity === 'X') {
                    return 'Jako otvorena usta'
                }
            }

            function formatEmotion(emotion) {
                if (emotion === 'SA') {
                    return 'Tuga'
                }
                else if (emotion === 'AN') {
                    return 'Srdžba'
                }
                else if (emotion === 'SP') {
                    return 'Iznenađenje'
                }
                else if (emotion === 'DI') {
                    return 'Gađenje'
                }
                else if (emotion === 'FE') {
                    return 'Strah'
                }
                else if (emotion === 'HA') {
                    return 'Sreća'
                }
            }

        })

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + "rezultati.xlsx"
        );


        return workbook.xlsx.write(res).then(function () {
            console.log("File write done");
            res.status(200).end();
        });

    }
    catch (err) {
        console.log(err);
        return res.status(400).json({
            message: "Greška ! Ne mogu exportat excelicu!",
        });
    }

});

module.exports = router;