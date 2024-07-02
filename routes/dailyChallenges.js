const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// @route   POST api/users/update-daily-challenge
// @desc    Update individual daily challenge data
// @access  Private
router.post("/update-daily-challenge", auth, async (req, res) => {
  const { email, dailyChallenge } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Merge new daily challenge data with existing data
    const updatedDailyChallenges = user.dailyChallenge.map((challenge) => {
      const newChallenge = dailyChallenge.find(
        (dc) => dc.day === challenge.day
      );
      return newChallenge ? { ...challenge, ...newChallenge } : challenge;
    });

    dailyChallenge.forEach((newChallenge) => {
      if (!updatedDailyChallenges.find((dc) => dc.day === newChallenge.day)) {
        updatedDailyChallenges.push(newChallenge);
      }
    });

    user.dailyChallenge = updatedDailyChallenges;

    await user.save();

    res
      .status(200)
      .json({ message: "Daily challenge data updated successfully." });
  } catch (error) {
    console.error("Error updating daily challenge data:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
