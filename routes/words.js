const express = require("express");
const router = express.Router();
const Word = require("../models/Word");
const DailyWord = require("../models/DailyWord");

// @route   POST api/words/add
// @desc    Endpoint to add multiple words
// @access  Public
router.post("/add", async (req, res) => {
  const words = req.body; // Expect an array of word objects
  // console.log(words);
  // [
  //   { "word": "apple", "meaning": "a sweet, edible fruit", "level": 2 },
  //   { "word": "banana", "meaning": "a long, curved fruit with a yellow peel", "level": 1 },
  //   { "word": "cat", "level": 3 }
  // ]

  try {
    const createdWords = await Word.create(words); // Create multiple documents
    res.status(201).json(createdWords); // Return created words
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Level already exists", word: error.keyValue.level });
    }
    console.error(error.keyValue.level);
    res.status(500).send("Error creating words");
  }
});

// @route   POST api/words/daily/add
// @desc    Endpoint to add multiple daily words
// @access  Public
router.post("/daily/add", async (req, res) => {
  // const words = req.body; // Expect an array of word objects
  // console.log(words);
  // [
  //   { "word": "apple", "meaning": "a sweet, edible fruit", "level": 2 },
  //   { "word": "banana", "meaning": "a long, curved fruit with a yellow peel", "level": 1 },
  //   { "word": "cat", "level": 3 }
  // ]

  try {
    const words = req.body;

    if (!Array.isArray(words) || words.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid input, array of words expected" });
    }

    // Fetch the latest day key from the database
    const latestEntry = await DailyWord.findOne().sort({ day: -1 }).exec();
    let latestDate;
    if (latestEntry) {
      const dayString = latestEntry.day.replace("day_", "");
      const formattedDayString = `${dayString.slice(0, 4)}-${dayString.slice(
        4,
        6
      )}-${dayString.slice(6, 8)}`;
      latestDate = latestEntry ? new Date(formattedDayString) : new Date();
    } else if (latestEntry === null) {
      latestDate = new Date();
    }

    // Iterate over the words array to create new entries
    const newEntries = words.map((wordObj, index) => {
      const newDate = new Date(latestDate);
      newDate.setDate(latestDate.getDate() + index + 1);
      const newDayKey = `day_${newDate
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "")}`;

      return {
        word: wordObj.word,
        meaning: wordObj.meaning,
        day: newDayKey,
      };
    });

    // Save the new entries to the database
    await DailyWord.insertMany(newEntries);

    res.status(201).json(newEntries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @route   GET api/words/daily
// @desc    Endpoint to get words by level
// @access  Public
router.get("/daily", async (req, res) => {
  try {
    const { day } = req.query;

    const words = await DailyWord.findOne({ day: day });

    if (!words) {
      return res.status(404).json({ error: "No words found for this day" });
    }

    res.json({ words: words.word, meaning: words.meaning, day: words.day });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
