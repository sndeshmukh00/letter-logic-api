// models/User.js
const mongoose = require("mongoose");

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
});

module.exports = mongoose.model("user", UserSchema);
