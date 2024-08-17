const express = require("express");
const router = express.Router();
const Invoices = require("../../models/Invoices");

const { parseDate } = require("../../helpers/parseDate");

const auth = require("../../middleware/auth");
const isFinanceAdmin = require("../../middleware/isFinanceAdmin");

// @route    GET api/invoices/:id
// @desc     Get one invoice
// @access   Private
router.get("/:invoiceId", [auth, isFinanceAdmin], async (req, res) => {
  const { invoiceId } = req.params;

  try {
    // Find the invoice by ID and populate related fields
    const invoice = await Invoices.findOne({ _id: invoiceId });

    if (!invoice) {
      return res.status(404).send({
        error: "Not Found",
        message: "Invoice not found.",
      });
    }

    return res.status(200).send(invoice);
  } catch (error) {
    return res.status(500).send({
      error: "Server error",
      message: error.message,
    });
  }
});

// @route    GET api/invoices
// @desc     Get all invoices
// @access   Private
router.get("/", [auth, isFinanceAdmin], async (req, res) => {
  try {
    // Find all invoices
    const invoices = await Invoices.find();

    return res.status(200).send(invoices);
  } catch (error) {
    return res.status(500).send({
      error: "Server error",
      message: error.message,
    });
  }
});

// @route    POST api/invoices
// @desc     Create a new invoice
// @access   Private
router.post("/", [auth, isFinanceAdmin], async (req, res) => {
  const { project, client, quotation, payment, date } = req.body;

  const parsedDate = parseDate(date);

  try {
    // Create new invoice
    const newInvoice = new Invoices({
      invoiceNumber: Math.floor(Math.random() * 1000000000),
      project,
      client,
      quotation,
      payment,
      dateIssued: parsedDate,
    });

    const invoice = await newInvoice.save();

    return res.status(202).send({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    return res.status(500).send({
      error: "Server error",
      message: error.message,
    });
  }
});

// @route    PUT api/invoices/:id
// @desc     Update an existing invoice
// @access   Private
router.put("/:id", [auth, isFinanceAdmin], async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    // Find and update the invoice
    const result = await Invoices.updateOne(
      { _id: id },
      { $set: updateFields }
    );

    if (result.nModified === 0) {
      return res.status(404).send({
        error: "Not Found",
        message: "Invoice not found or no changes made.",
      });
    }

    return res.status(200).send({
      message: "Invoice updated successfully",
    });
  } catch (error) {
    return res.status(500).send({
      error: "Server error",
      message: error.message,
    });
  }
});

// @route    DELETE api/invoices/:id
// @desc     Delete an invoice
// @access   Private
router.delete("/:invoiceId", [auth, isFinanceAdmin], async (req, res) => {
  const invoiceId = req.params.invoiceId;

  try {
    // Find and delete the invoice
    await Invoices.deleteOne({ _id: invoiceId });

    return res.status(200).send({
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    return res.status(500).send({
      error: "Server error",
      message: error.message,
    });
  }
});

module.exports = router;
