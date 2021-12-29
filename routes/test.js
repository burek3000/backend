var express = require('express');
var router = express.Router();
const fs = require('fs')

router.get('/imageNames', async (req, res) => {

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

module.exports = router;