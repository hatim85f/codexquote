const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SchemaName = Schema({
  companyName: {
    type: String,
    required: true,
  },
  companyLogo: {
    type: String,
    required: true,
  },
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  prjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
  ],
});

module.exports = ModelName = mongoose.model("title", SchemaName);
