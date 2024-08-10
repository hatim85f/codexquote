const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuotationsSchema = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
  },
  quotationNumber: {
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
  dateIssued: {
    type: Date,
    required: true,
    default: Date.now,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  quotationItems: [
    {
      itemTitle: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
      },
      unitPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      totalPrice: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  projectType: {
    type: String,
    required: true,
    enum: [
      "WordPress",
      "Shopify",
      "React",
      "RN",
      "Mobile App",
      "Web App",
      "Other",
    ],
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0, // Added minimum validation
  },
  overview: {
    type: String,
    required: true,
  },
  overviewText: {
    type: String,
    required: true,
  },
  overviewItems: [
    {
      itemTitle: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
  ],
  customerResponsibilities: {
    type: [String],
    required: true,
  },
  timeline: {
    type: Number,
    required: true,
    min: 1,
  },
  commitments: {
    type: String,
    required: true,
  },
  termsAndConditions: {
    type: [String],
    required: true,
  },
  paymentTerms: {
    type: [String],
    required: true,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
  },
});

module.exports = Quotations = mongoose.model("quotations", QuotationsSchema);
