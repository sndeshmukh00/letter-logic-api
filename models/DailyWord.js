const mongoose = require("mongoose");

const DailyWordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  day: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("DailyWord", DailyWordSchema);
