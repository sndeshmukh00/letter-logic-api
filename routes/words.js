const express = require("express");
const router = express.Router();
const Word = require("../models/Word");

//
// @route   POST api/words/add
// @desc    Endpoint to add multiple words
// @access  Private
router.post("/add", async (req, res) => {
  const words = req.body; // Expect an array of word objects
  console.log(words);
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
        .json({ error: "Word already exists", word: error.keyValue.word });
    }
    console.error(error.keyValue.word);
    res.status(500).send("Error creating words");
  }
});

module.exports = router;
