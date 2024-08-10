const mongoose = require("mongoose");
const isCompanyAdmin = require("../middleware/isCompanyAdmin");
const Schema = mongoose.Schema;

const UserSchema = Schema({
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
    required: true,
  },
  isCompanyAdmin: {
    type: Boolean,
    required: true,
  },
});

module.exports = User = mongoose.model("user", UserSchema);
