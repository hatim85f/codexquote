const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FeedbackSchema = Schema({
  client: {
    type: mongoose.Types.ObjectId,
    ref: "clients",
  },
  project: {
    type: mongoose.Types.ObjectId,
    ref: "projects",
  },
  starsNumber: {
    type: Number,
    required: true,
  },
  feedbackText: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  feedbackTitle: {
    type: String,
    required: true,
  },
});

module.exports = Feedback = mongoose.model("feedback", FeedbackSchema);
