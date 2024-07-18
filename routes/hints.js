// routes/hints.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// @route   Get api/hints
// @desc    Get number of hints using user Email
// @access  Private
router.get("/", auth, async (req, res) => {
  const { email } = req.query;

  try {
    // Find the user by userId
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // get hints from the user's balance
    const hints = user.hints;

    res.json({ msg: "hints Fetched successfully", hints: hints });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/hints/add
// @desc    Post number of hints using user ID
// @access  Private
router.post("/add", auth, async (req, res) => {
  const { email, hints } = req.body;

  try {
    // Find the user by userId
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Add hints to the user's balance
    user.hints += hints;
    await user.save();

    res.json({ msg: "hints added successfully", hints: user.hints });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/hints/use
// @desc    Use number of hints using user ID
// @access  Private
router.put("/use", auth, async (req, res) => {
  const { email, hints } = req.body;

  try {
    // Find the user by userId
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if the user has enough hints
    if (user.hints < hints) {
      return res.status(400).json({ msg: "Not enough hints" });
    }

    // Subtract hints from the user's balance
    user.hints -= hints;
    await user.save();

    res.json({ msg: "hints used successfully", hints: user.hints });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
