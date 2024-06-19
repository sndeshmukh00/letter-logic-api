// routes/level.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Word = require("../models/Word");
const auth = require("../middleware/auth");
require("dotenv").config();

// @route   PUT api/level/set
// @desc    Endpoint to set user level
// @access  Private
router.put("/set", auth, async (req, res) => {
  const { email, level } = req.body;

  if (!email || !level) {
    return res.status(400).json({ error: "Email and level are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.level = level;
    await user.save();

    res.json({ message: "User level updated successfully", level: user.level });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/level/words
// @desc    Endpoint to get words by level
// @access  Private
router.get("/words", auth, async (req, res) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const words = await Word.findOne({ level: user.level });

    if (!words) {
      return res.status(404).json({ error: "No words found for this level" });
    }

    res.json({ words: words.word });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
