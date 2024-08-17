const express = require("express");
const router = express.Router();
const Payments = require("../../models/Payments");
const Projects = require("../../models/Projects");
const Clients = require("../../models/Clients");
const Quotations = require("../../models/Quotations");
const Income = require("../../models/Income");
const Invoices = require("../../models/Invoices");

const auth = require("../../middleware/auth");
const isFinanceAdmin = require("../../middleware/isFinanceAdmin");

const { parseDate } = require("../../helpers/parseDate");
const isCompanyAdmin = require("../../middleware/isCompanyAdmin");

// update client payments and reflect this to payments collection and income (isCompanyAdmin and isFinanceAdmin validation needed)

// every payment is a new payment, related to a project
// every payment we will create a separate payment record in the payments collection either + or - based on the payment status
// we will update the income collection based on the payment status using the project id as a reference
// we will update the client collection to add the payment id to the client payments array
// we will update project.amountsPaid array to add the payment id and the amount paid

// @route    POST api/payment
// @desc     Get one payment
// @access   Private
router.get("/:paymentId", isCompanyAdmin, async (req, res) => {
  try {
    const paymentId = req.params.paymentId;

    const payment = await Payments.findOne({ _id: paymentId });

    if (!payment) {
      return res.status(404).send({
        error: "Not found",
        message: "Payment was not found. Incorrect id",
      });
    }
    return res.status(200).send(payment);
  } catch (error) {
    return res.status(500).send({
      error: "Server error",
      message: err.message,
    });
  }
});

// @route    POST api/payment
// @desc     Get all payments
// @access   Private
router.get("/", isCompanyAdmin, async (req, res) => {
  try {
    const payments = await Payments.find();

    return res.status(200).send(payments);
  } catch (error) {
    return res.status(500).send({
      error: "Server error",
      message: err.message,
    });
  }
});

// @route    POST api/payment
// @desc     Create payment
// @access   Private
router.post("/", [auth, isFinanceAdmin], async (req, res) => {
  const {
    project,
    client,
    amount,
    date,
    paymentMethod,
    status,
    transactionId,
    currency,
    isPartialPayment,
    receiptUrl,
    paymentDescription,
  } = req.body;

  try {
    // Check if the payment already exists based on transactionId
    const existingPayment = await Payments.findOne({ transactionId });

    if (existingPayment) {
      return res.status(400).send({
        message:
          "Duplicate payment detected. This transaction has already been processed.",
      });
    }

    // Create new payment
    const parsedDate = parseDate(date);

    const newPayment = new Payments({
      project,
      client,
      amount,
      date: parsedDate,
      paymentMethod,
      status,
      transactionId,
      currency,
      isPartialPayment,
      receiptUrl,
      paymentDescription,
    });

    const savedPayment = await newPayment.save();

    // Update client payments array
    await Clients.updateOne(
      { _id: client },
      {
        $addToSet: { payments: savedPayment._id },
      }
    );

    // Get quotation details
    const quotationDetails = await Quotations.findOne({ project });
    const quotationId = quotationDetails._id;

    // Create new invoice
    const newInvoice = new Invoices({
      invoiceNumber: Math.floor(Math.random() * 1000000000),
      project,
      client,
      quotation: quotationId,
      payment: savedPayment._id,
      dateIssued: parsedDate,
    });

    const savedInvoice = await newInvoice.save();

    // Update project amountsPaid array
    await Projects.updateOne(
      { _id: project },
      {
        $addToSet: {
          amountsPaid: {
            amount,
            paymentId: savedPayment._id,
            invoiceId: savedInvoice._id,
          },
        },
      }
    );

    // Update income collection
    if (status === "Confirmed" || status === "Paid") {
      const updateIncome = {
        $inc: {
          paidAmount: amount,
          remainingAmount: -amount,
        },
        $set: {
          type: status, // This will be either "Confirmed" or "Paid"
          date: parsedDate,
          invoice: savedInvoice._id,
        },
      };

      if (isPartialPayment) {
        await Income.updateMany({ project }, updateIncome);
      } else {
        await Income.updateOne({ project }, updateIncome);
      }
    } else {
      return res.status(202).send({
        message:
          "Payment created successfully but still Pending, please confirm the payment in Incomes Section once confirmed",
      });
    }

    return res.status(200).send({ message: "Payment created successfully" });
  } catch (error) {
    return res.status(500).send({
      error: "Error",
      message: error.message,
    });
  }
});

// @route    POST api/payment
// @desc     Edit payment
// @access   Private
router.put("/:paymentId", [auth, isFinanceAdmin], async (req, res) => {
  const paymentId = req.params.paymentId;
  const { status, project } = req.body;

  try {
    const payment = await Payments.findOne({ _id: paymentId });
    const income = await Income.findOne({ project });

    // Set the amount to either increment or decrement
    const sign = status === "Paid" || status === "Confirmed" ? 1 : -1;

    // Set the type of income document
    const type =
      income.remainingAmount === payment.amount && sign === 1 // If the remaining ammount is 0
        ? "Paid"
        : income.paidAmount === payment.amount && sign === -1 // If the paid ammount is 0
        ? "Possible"
        : "Confirmed"; // Else

    return res.status(200).send({ sign, type, amount: payment });

    await Income.updateMany(
      { project },
      {
        $inc: {
          paidAmount: payment.amount * sign,
          remainingAmount: -(payment.amount * sign),
        },
        $set: { type },
      }
    );

    await Payments.updateMany(
      { _id: paymentId },
      {
        $set: {
          status,
        },
      }
    );

    return res.status(200).send({ message: "Payment updated successfully" });
  } catch (error) {
    return res.status(500).send({
      error: "Server error",
      message: error.message,
    });
  }
});

module.exports = router;
