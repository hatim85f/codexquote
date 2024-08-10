const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExpensesSchema = Schema({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
  },
  paidFor: {
    type: String,
    required: true,
  },
  paidBy: {
    type: mongoose.Types.ObjectId,
    ref: "users",
  },
  project: {
    type: mongoose.Types.ObjectId,
    ref: "projects",
    // to count expenses for a project so we can get the net profit
  },
  client: {
    type: mongoose.Types.ObjectId,
    ref: "clients",
    // to count expenses for a client so we can get the net profit
  },
});

module.exports = Expenses = mongoose.model("expenses", ExpensesSchema);
