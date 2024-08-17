const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClientsSchema = Schema({
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
  companyWebsite: {
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
  clientNumber: {
    type: Number,
    unique: true,
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
    type: mongoose.Types.ObjectId,
    ref: "feedback",
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  bankDetails: {
    bankName: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    iban: {
      type: String,
    },
    swiftCode: {
      type: String,
    },
  }, // will be needed in future businesses
});

module.exports = Clients = mongoose.model("clients", ClientsSchema);
