// routes/coins.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// @route   POST api/coins/add
// @desc    Post number of coins using user ID
// @access  Private
router.post("/add", auth, async (req, res) => {
  const { email, coins } = req.body;

  try {
    // Find the user by userId
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Add coins to the user's balance
    user.coins += coins;
    await user.save();

    res.json({ msg: "Coins added successfully", coins: user.coins });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/coins/use
// @desc    Use number of coins using user ID
// @access  Private
router.put("/use", auth, async (req, res) => {
  const { email, coins } = req.body;

  try {
    // Find the user by userId
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if the user has enough coins
    if (user.coins < coins) {
      return res.status(400).json({ msg: "Not enough coins" });
    }

    // Subtract coins from the user's balance
    user.coins -= coins;
    await user.save();

    res.json({ msg: "Coins used successfully", coins: user.coins });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
