// models/User.js
const mongoose = require("mongoose");

const dailyChallengeSchema = new mongoose.Schema({
  day: { type: String, required: true }, // Date in 'YYYYMMDD' format
  row: [[String]], // Array of arrays of strings
  currentRow: Number,
  currentCell: Number,
  gameStat: { type: String, enum: ["playing", "won", "lost"], required: true },
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  coins: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  streak: {
    type: Number,
    default: 0,
  },
  dailyChallenge: [dailyChallengeSchema], // Add dailyChallenge field
});

module.exports = mongoose.model("user", UserSchema);
