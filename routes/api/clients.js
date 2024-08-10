const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const isCompanyAdmin = require("../../middleware/isCompanyAdmin");
const Client = require("../../models/Clients");

// Youssef Tasks

// we need to create the following functions

// update client password from user side (no isCompanyAdmin validation needed just auth)
// update client profile from user side (no isCompanyAdmin validation needed just auth)
// update client payments and reflect this to payments collection and income (isCompanyAdmin and isFinanceAdmin validation needed)
// update client profile from company side (isCompanyAdmin validation needed)
// delete client from company side (isCompanyAdmin validation needed)

module.exports = router;
