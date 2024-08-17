const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SchemaName = Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  details: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "serviceItem",
    },
  ],
});

module.exports = ModelName = mongoose.model("title", SchemaName);
