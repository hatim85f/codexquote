const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const isCompanyAdmin = require("../../middleware/isCompanyAdmin");
const User = require("../../models/Users");
const Users = require("../../models/Users");
const Reset = require("../../models/Reset");
const sgMail = require("@sendgrid/mail");
const moment = require("moment");

const Mail_API_Key = process.env.Mail_API_Key;

const setcretToken =
  process.env.NODE_ENV === "production"
    ? process.env.jwtSecret
    : config.get("jwtSecret");

// getting user profile
// access   Private needs login token
router.get("/:email", auth, async (req, res) => {
  try {
    const { email } = req.params;

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(500).send({
        error: "Error",
        message: "User does not exist",
      });
    }

    res.status(201).json({ user });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// @route POST api/auth
// @desc Authenticate user
// @access Public
// return the user and token when user logging in with google or facebook

router.post("/google", async (req, res) => {
  const { email } = req.body;

  try {
    let user = await Users.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        message: "User does not exist",
      });
    }

    const payload = {
      user: {
        id: user._id,
      },
    };

    jwt.sign(payload, setcretToken, (error, token) => {
      if (error) throw error;
      res.json({ token, user });
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

//@route    POST api/auth
//@des      Authenticate users and get the token
//@access   Public
router.post(
  "/",
  [
    check("email", "Please include a valid Email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Please include a valid Email and Password" });
    }

    const { email, password } = req.body;

    // checking if user exists
    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid Username or password" });
      }

      // match user
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Invalid Username or Password" });
      }

      // return token

      const payload = {
        user: {
          id: user._id,
        },
      };

      jwt.sign(payload, setcretToken, (error, token) => {
        if (error) throw error;
        res.json({ token, user });
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
);

// creating new user
router.post("/register", async (req, res) => {
  const {
    userName,
    phone,
    email,
    avatar,
    password,
    position,
    projects,
    isCompanyAdmin,
  } = req.body;

  try {
    // check if user exists
    let user = await Users.findOne({ email });
    if (user) {
      return res.status(500).send({
        error: "Error",
        message:
          "User already exists, if you forgotten your credentials please click forgot password",
      });
    }

    const newUser = new User({
      userName,
      phone,
      email,
      avatar,
      position,
      projects,
      isCompanyAdmin,
    });

    const payload = {
      user: {
        id: newUser._id,
      },
    };

    const salt = await bcrypt.genSalt(10);

    newUser.password = await bcrypt.hash(password, salt);

    await newUser.save();

    jwt.sign(payload, setcretToken, (error, token) => {
      if (error) throw error;
      res.json({
        token,
        user: newUser,
        message: "User created and waiting for admins approval",
      });
    });
  } catch (error) {
    return res.status(500).send({
      error: "Error",
      message: error.message,
    });
  }
});

// we will create a reset password function later after registering the project in sendgrid

//@Route   DELETE api/auth
//@desc    Delete user
//@access  Private
router.delete("/userId", [auth, isCompanyAdmin], async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Users.findOne({ _id: userId.toString() });

    if (!user) {
      return res.status(500).send({
        error: "Error",
        message: "User does not exist",
      });
    }

    await Users.deleteOne({ _id: userId.toString() });

    return res.status(200).send({
      message: `User ${user.name} has been deleted successfully`,
    });
  } catch (error) {
    return res.status(500).send({
      error: "Error",
      message: error.message,
    });
  }
});

// @route   POST api/auth/forgot
// @desc    Forgot Password
// @access  Public
router.post("/forgot", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Users.findOne({
      email,
    });

    if (!user) {
      return res.status(500).send({
        error: "Error",
        message:
          "User does not exist, please make sure you have entered the correct email",
      });
    }

    const currentTime = new Date();
    const tenMinutesAgo = new Date(currentTime.getTime() - 10 * 60 * 1000);

    // Check if a reset code has been generated in the last 10 minutes
    const existingReset = await Reset.findOne({
      userId: user._id,
      createdAt: { $gt: tenMinutesAgo }, // find reset code created within the last 10 minutes
    });

    if (existingReset) {
      return res.status(400).send({
        error: "Error",
        message:
          "A reset code has already been sent. Please wait 10 minutes before requesting a new code.",
      });
    }

    // Remove any existing reset code for this user if it's older than 10 minutes
    await Reset.deleteMany({ userId: user._id });

    const resetCode = Math.floor(1000 + Math.random() * 9000);

    // use template for sending email

    // sending email
    sgMail.setApiKey(Mail_API_Key);

    const msg = {
      to: email,
      from: "info@codexpandit.com",
      templateId: "d-ab6ab1f201b84ae1aedf1beb97fecca2",
      dynamicTemplateData: {
        user_name: user.userName,
        reset_code: resetCode,
        requested_at: new Date().toLocaleString(),
      },
    };

    sgMail.send(msg);

    await Reset.insertMany({
      userId: user._id,
      resetCode,
    });

    return res.status(200).send({
      message:
        "Reset code has been sent to your email, code will be expired in 10 minutes",
    });
  } catch (error) {
    return res.status(500).send({
      error: "Error",
      message: error.message,
    });
  }
});

// @route   POST api/auth/reset
// @desc    Reset Password
// @access  Public
router.post("/reset", async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  try {
    const user = await Users.findOne({
      email,
    });

    if (!user) {
      return res.status(500).send({
        error: "Error",
        message: "User does not exist",
      });
    }

    const reset = await Reset.findOne({
      userId: user._id,
      resetCode,
    });

    if (!reset) {
      return res.status(500).send({
        error: "Error",
        message: "Invalid reset code, or may be expired",
      });
    }

    await Reset.deleteOne({
      userId: user._id,
      resetCode,
    });

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    return res.status(200).send({
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return res.status(500).send({
      error: "Error",
      message: error.message,
    });
  }
});

module.exports = router;
