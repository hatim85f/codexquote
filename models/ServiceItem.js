const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServiceItemSchema = Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
});

module.exports = ServiceItem = mongoose.model("servieItem", ServiceItemSchema);
