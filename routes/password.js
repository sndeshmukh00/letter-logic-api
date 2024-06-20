// routes/password.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const axios = require("axios");
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
    subject: "Password Reset OTP",
    text: `Your OTP for password reset is: ${OTP}`,
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

// @route   POST api/password/forgot
// @desc    Request password reset OTP
// @access  Public
router.post("/forgot", async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User does not exist!" });
    }

    const OTP = generateOTP();
    user.otp = OTP;
    user.otpExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    await sendOTPEmail(email, OTP);

    res.status(200).json({ msg: "OTP sent to email" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/password/reset
// @desc    Reset password using OTP
// @access  Public
router.post("/reset", async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    let user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({ msg: "Password reset successful" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
