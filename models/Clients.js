const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClientsSchema = Schema({
  _id: {
    type: mongoose.Types.ObjectId,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  password: {
    type: String,
  },
  companyName: {
    type: String,
    required: true,
  },
  companyLogo: {
    type: String,
    required: true,
  },
  companyEmail: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  projects: {
    type: Array,
    required: true,
  },
  payments: {
    type: Array,
    default: [],
  },
  feedback: {
    starsNumber: {
      type: Number,
      default: 0,
    },
    feedbackText: {
      type: String,
      default: "",
    },
    feedbackTitle: {
      type: String,
      default: "",
    },
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Clients = mongoose.model("clients", ClientsSchema);
