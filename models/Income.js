const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IncomeSchema = Schema({
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
  project: {
    type: Schema.Types.ObjectId,
    ref: "projects",
    required: true,
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: "clients",
    required: true,
  },
  quotation: {
    type: Schema.Types.ObjectId,
    ref: "quotations",
    required: true,
  },
  invoice: {
    type: Schema.Types.ObjectId,
    ref: "invoices",
  },
  status: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["Possible", "Confirmed", "Paid"],
  },
  paidAmount: {
    type: Number,
    required: true,
  },
  remainingAmount: {
    type: Number,
    required: true,
  },
});

module.exports = Income = mongoose.model("income", IncomeSchema);
