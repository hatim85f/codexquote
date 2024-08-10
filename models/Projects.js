const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectsSchema = Schema({
  _id: {
    type: mongoose.Types.ObjectId,
  },
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
  client: {
    type: mongoose.Types.ObjectId,
    ref: "clients",
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  paymentsSchedule: [
    {
      dueDate: {
        type: Date,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
  ],
  amountsPaid: [
    {
      amount: {
        type: Number,
        default: 0,
      },
      paymentId: {
        type: mongoose.Types.ObjectId,
        ref: "payments",
      },
      invoiceId: {
        type: mongoose.Types.ObjectId,
        ref: "invoices",
      },
    },
  ],
  projectUrl: {
    type: String,
    unique: true,
  },
});

// Virtual field for remainingAmount
ProjectsSchema.virtual("remainingAmount").get(function () {
  const totalPaid = this.amountsPaid.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  return this.totalPrice - totalPaid;
});

module.exports = Projects = mongoose.model("projects", ProjectsSchema);
