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
const Clients = require("../../models/Clients");
const {
  formattedNumberWithPadding,
} = require("../../helpers/formattedNumberWithPadding");

// @route    GET api/client
// @desc     Get one client
// @access   Private
router.get("/:clientId", isCompanyAdmin, async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await Client.findOne({ _id: clientId });

    if (!client) {
      return res.status(404).send({
        error: "Not found",
        message: "Client was not found. Incorrect id",
      });
    }
    return res.status(200).send(client);
  } catch (error) {
    return res.status(500).send({
      error: "Server error",
      message: err.message,
    });
  }
});

// @route    GET api/client
// @desc     Get all clients
// @access   Private
router.get("/", isCompanyAdmin, async (req, res) => {
  try {
    const clients = await Client.find();

    return res.status(200).send(clients);
  } catch (error) {
    return res.status(500).send({
      error: "Server error",
      message: err.message,
    });
  }
});

// @route    POST api/client
// @desc     Create a new client
// @access   Private
router.post("/client", [auth, isCompanyAdmin], async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    companyName,
    companyLogo,
    companyEmail,
    companyWebsite,
    country,
    position,
  } = req.body;

  try {
    const isClientExist = await Clients.findOne({ email: email });

    if (isClientExist) {
      return res.status(500).send({
        error: "Error",
        message: "Client already exists",
      });
    }

    // create a new client

    // getting client number
    const startingClientNumber = 32; // number of clients created before the system;

    // getting stored clients
    const clients = await Clients.find();
    const nextClientNumber =
      startingClientNumber + parseInt(clients.length) + 1; // Determine the next client number

    const clientNumber = formattedNumberWithPadding(nextClientNumber);

    const clientPassword = `${firstName.toLowerCase()}${phone.slice(-4)}`;

    const newClient = new Clients({
      firstName,
      lastName,
      email,
      phone,
      companyName,
      companyLogo,
      companyEmail,
      companyWebsite,
      country,
      position,
      clientNumber,
      projects: [],
      payments: [],
      password: `${clientPassword.trim()}`, // cleint password will be first name + last 4 digits of phone number
    });

    const savedClient = await newClient.save();
    const clientId = savedClient._id;
    return res.status(200).send({
      message: "Client created successfully",
      client: newClient,
    });
  } catch (error) {
    return res.status(500).send({
      error: "Error",
      message: error.message,
    });
  }
});

// @route    PUT api/client
// @desc     Change user password
// @access   Private
router.put("/user/password/:clientId", auth, async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const { oldPassword, newPassword } = req.body;

    // Check if old and new passwords are the same
    if (oldPassword === newPassword)
      return res.status(400).send({
        error: "Same password",
        message: `New password can't be the same as old password`,
      });
    const client = await Client.findOne({ _id: clientId });

    if (!client) {
      return res.status(404).send({
        error: "Not found",
        message: "Client not found",
      });
    }

    // Check if password is correct
    const isMatch =
      client.password === oldPassword ||
      (await bcrypt.compare(oldPassword, client.password));

    if (!isMatch) {
      return res.status(500).send({
        error: "Incorrect password",
        message: `Old password is incorrect`,
      });
    }

    // Change password
    const salt = await bcrypt.genSalt(10);

    hashedPassword = await bcrypt.hash(newPassword, salt);

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

// @route    PUT api/client
// @desc     edit user profile from user side
// @access   Private
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

// @route    DELETE api/client
// @desc     delete client
// @access   Private
router.delete("/:clientId", isCompanyAdmin, async (req, res) => {
  try {
    const clientId = req.params.clientId;

    const result = await Client.deleteOne({ _id: clientId });

    // Check if client exists
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
