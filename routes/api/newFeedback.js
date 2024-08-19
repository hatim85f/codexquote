const express = require("express");
const router = express.Router();
const NewFeedback = require("../../models/NewFeedback");

router.post("/", async (req, res) => {
  const {
    clientName,
    clientEmail,
    clientPhone,
    clientProject,
    clientFeedback,
    feedbackTitle,
    clientPosition,
    imageURL,
    clientRating,
  } = req.body;

  try {
    const newFeedback = new NewFeedback({
      clientName,
      clientEmail,
      clientPhone,
      clientProject,
      clientFeedback,
      feedbackTitle,
      clientPosition,
      imageURL,
      clientRating,
    });

    await newFeedback.save();
    return res.status(200).send(newFeedback);
  } catch (error) {
    return res.status(500).send({
      error: "Server error",
      message: error.message,
    });
  }
});

module.exports = router;