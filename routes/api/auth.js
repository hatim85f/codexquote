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
      res.json({ token, user: newUser });
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

module.exports = router;
