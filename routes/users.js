// routes/users.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/User");
const axios = require("axios");
const auth = require("../middleware/auth");
require("dotenv").config();

// Generate OTP function
function generateOTP() {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

// Send OTP email using MailerSend
async function sendOTPEmail(email, OTP) {
  const data = {
    from: {
      email: process.env.MAILERSEND_FROM_EMAIL,
      name: "Letter Logic",
    },
    to: [
      {
        email: email,
        name: "User",
      },
    ],
    subject: "OTP for Letter Logic account verification",
    text: `Your OTP for Letter Logic account verification is: ${OTP}`,
  };

  try {
    await axios.post("https://api.mailersend.com/v1/email", data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
      },
    });
  } catch (error) {
    console.error("Error sending OTP email:", error.response.data);
    throw new Error("Could not send OTP email");
  }
}

// @route   POST api/users/send-otp
// @desc    Send OTP to user email
// @access  Public
router.post("/send-otp", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Generate OTP
    const OTP = generateOTP();

    // Send OTP to user's email
    await sendOTPEmail(email, OTP);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store OTP and hashed password temporarily
    user = new User({
      name,
      email,
      password: hashedPassword,
      otp: OTP,
      verified: false,
    });

    await user.save();

    res.status(200).json({ msg: "OTP sent to email" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/users/verify-otp
// @desc    Verify OTP and create user
// @access  Public
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // Clear the OTP and set verified to true
    user.otp = undefined;
    user.verified = true;
    user.coins = 500;
    await user.save();

    // Return JWT token (optional)
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: 3600 }, // 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// @route   POST api/users/delete
// @desc    Delete an existing user
// @access  Private
router.delete("/delete", auth, async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    // Delete user if found
    user = await User.findOneAndDelete({ email });
    res.status(200).json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/users/daily-data
// @desc    Post daily challenge data
// @access  Private
router.post("/daily-data", auth, async (req, res) => {
  const { email, day, row, currentRow, currentCell, gameStat } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if a record for the given date already exists
    const existingChallengeIndex = user.dailyChallenge.findIndex(
      (challenge) => challenge.date === date
    );

    if (existingChallengeIndex !== -1) {
      // Update existing record
      user.dailyChallenge[existingChallengeIndex] = {
        day,
        row,
        currentRow,
        currentCell,
        gameStat,
      };
    } else {
      // Add new record
      user.dailyChallenge.push({
        day,
        row,
        currentRow,
        currentCell,
        gameStat,
      });
    }

    await user.save();

    res
      .status(200)
      .json({ message: "Daily challenge data saved successfully." });
  } catch (error) {
    console.error("Error saving daily challenge data:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// @route   GET api/users/info
// @desc    get user info data
// @access  Private
router.get("/info", auth, async (req, res) => {
  const { email } = req.query;

  try {
    // Find the user by email and project only the required fields
    const user = await User.findOne(
      { email },
      "name email _id coins level streak dailyChallenge"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user info:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
