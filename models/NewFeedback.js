const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NewFeedbackSchema = Schema({
  clientName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
    required: true,
  },
  clientPhone: {
    type: String,
    required: true,
  },
  clientProject: {
    type: String,
    required: true,
  },
  clientFeedback: {
    type: String,
    required: true,
  },
  feedbackTitle: {
    type: String,
    required: true,
  },
  clientPosition: {
    type: String,
    required: true,
  },
  imageURL: {
    type: String,
    required: true,
  },
  clientRating: {
    type: Number,
    required: true,
  },
});

module.exports = NewFeedback = mongoose.model("newFeedback", NewFeedbackSchema);
