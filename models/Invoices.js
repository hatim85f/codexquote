const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InvoicesSchema = Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
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
  quotation: {
    type: mongoose.Types.ObjectId,
    ref: "quotations",
    required: true,
  },
  payment: {
    type: mongoose.Types.ObjectId,
    ref: "payments",
    required: true,
  },
  dateIssued: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = Invoices = mongoose.model("invoices", InvoicesSchema);
