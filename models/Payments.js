const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentsSchema = Schema({
  _id: {
    type: mongoose.Types.ObjectId,
  },
  project: {
    type: mongoose.Types.ObjectId,
    ref: "projects",
    required: true,
  },
  client: {
    type: mongoose.Types.ObjectId,
    ref: "clients",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["Pending", "Paid", "Failed", "Refunded", "In Progress"],
  },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Paid"],
  },
  transactionId: {
    type: String,
  },
  currency: {
    type: String,
    required: true,
    default: "AED",
  },
  isPartialPayment: {
    type: Boolean,
    default: false,
  },
  receiptUrl: {
    type: String,
  },
});

module.exports = Payments = mongoose.model("payments", PaymentsSchema);
