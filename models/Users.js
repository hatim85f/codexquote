const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = Schema({
  userName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
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
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  projects: {
    type: Array,
  },
  isCompanyAdmin: {
    type: Boolean,
    default: false,
  },
  isFinanceAdmin: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
});

module.exports = User = mongoose.model("user", UserSchema);
