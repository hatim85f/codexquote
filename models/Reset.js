const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResetSchema = Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "users",
  },
  resetCode: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600,
  },
});

module.exports = Reset = mongoose.model("reset", ResetSchema);
