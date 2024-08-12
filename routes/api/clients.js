const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const isCompanyAdmin = require("../../middleware/isCompanyAdmin");
const isFinanceAdmin = require("../../middleware/isFinanceAdmin");

const Client = require("../../models/Clients");
const Payments = require("../../models/Payments");
const Income = require("../../models/Income");
const { parseDate } = require("../../helpers/parseDate");

// Youssef Tasks

// we need to create the following functions

// update client password from user side (no isCompanyAdmin validation needed just auth)

// updating user password while logged in
router.put("/user/password/:clientId", auth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { oldPassword, newPassword } = req.body;

    const client = await Client.findOne({ _id: clientId });

    // if (!client) {
    //   return res.status(404).send({
    //     error: "Not found",
    //     message: "Client not found",
    //   });
    // }

    // no need to find the client again as we already have the client id from the token
    // client is already logged

    const isMatch =
      client.password === oldPassword ||
      (await bcrypt.compare(oldPassword, client.password));

    if (!isMatch) {
      return res.status(500).send({
        error: "Incorrect password",
        message: `Old password is incorrect`,
      });
    }

    if (oldPassword === newPassword)
      return res.status(400).send({
        error: "Same password",
        message: `New password can't be the same as old password`,
      });

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await Client.updateOne(
      { _id: clientId },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );

    return res.status(200).send({
      message: `Password changed successfully`,
    });
  } catch (err) {
    return res.status(500).send({
      error: "Server error",
      message: err.message,
    });
  }
});

// update client profile from user side (no isCompanyAdmin validation needed just auth)
router.put("/profile/:clientId", auth, async (req, res) => {
  try {
    const clientId = req.params.clientId;

    const {
      firstName,
      lastName,
      email,
      avatar,
      phone,
      companyName,
      companyLogo,
      companyEmail,
      companyWebsite,
      country,
      position,
      bankDetails,
    } = req.body;

    // const client = await Client.findOne({ _id: clientId });

    // if (!client)
    //   return res.status(404).send({
    //     error: "Incorrect id",
    //     message: "Client not found",
    //   });

    // same comment as previous function
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (avatar) updateFields.avatar = avatar;
    if (phone) updateFields.phone = phone;
    if (companyName) updateFields.companyName = companyName;
    if (companyLogo) updateFields.companyLogo = companyLogo;
    if (companyEmail) updateFields.companyEmail = companyEmail;
    if (companyWebsite) updateFields.companyWebsite = companyWebsite;
    if (country) updateFields.country = country;
    if (position) updateFields.position = position;
    if (bankDetails) updateFields.bankDetails = bankDetails;

    await Client.updateOne(
      { _id: clientId },
      {
        $set: updateFields,
      }
    );

    return res.status(200).send({ message: "Profile updated successfully" });
  } catch (err) {
    return res.status(500).send({
      error: "Server error",
      message: err.message,
    });
  }
});

// update client profile from company side (isCompanyAdmin validation needed)
router.put("/admin/:clientId", isCompanyAdmin, async (req, res) => {
  try {
    const clientId = req.params.clientId;

    const {
      firstName,
      lastName,
      phone,
      email,
      avatar,
      companyName,
      companyLogo,
      companyEmail,
      companyWebsite,
      country,
      position,
      bankDetails,
      feedback,
    } = req.body;

    const client = await Client.findOne({ _id: clientId });

    if (!client)
      return res.status(404).send({
        error: "Incorrect id",
        message: "Client not found",
      });

    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (phone) updateFields.phone = phone;
    if (email) updateFields.email = email;
    if (avatar) updateFields.avatar = avatar;
    if (companyName) updateFields.companyName = companyName;
    if (companyLogo) updateFields.companyLogo = companyLogo;
    if (companyEmail) updateFields.companyEmail = companyEmail;
    if (companyWebsite) updateFields.companyWebsite = companyWebsite;
    if (country) updateFields.country = country;
    if (position) updateFields.position = position;
    if (bankDetails) updateFields.bankDetails = bankDetails;
    if (feedback) updateFields.feedback = feedback;

    await Client.updateOne(
      { _id: clientId },
      {
        $set: {
          updateFields,
        },
      }
    );

    return res.status(200).send({ message: "Profile updated successfully" });
  } catch (err) {
    return res.status(500).send({
      error: "Server error",
      message: err.message,
    });
  }
});

// delete client from company side (isCompanyAdmin validation needed)

router.delete("/:clientId", isCompanyAdmin, async (req, res) => {
  try {
    const clientId = req.params.clientId;

    const result = await Client.deleteOne({ _id: clientId });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        error: "Not found",
        message: "Client not found",
      });
    }

    return res.status(200).send({
      message: `Client deleted successfully`,
    });
  } catch (err) {
    return res.status(500).send({
      error: "Server error",
      message: err.message,
    });
  }
});
module.exports = router;
