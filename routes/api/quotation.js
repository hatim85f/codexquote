const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const isCompanyAdmin = require("../../middleware/isCompanyAdmin");
const Quotation = require("../../models/Quotations");
const Project = require("../../models/Projects");
const Client = require("../../models/Clients");
const Clients = require("../../models/Clients");
const { parseDate } = require("../../helpers/parseDate");
const { calculateEndDate } = require("../../helpers/calculateEndDate");
const Projects = require("../../models/Projects");
const {
  formattedNumberWithPadding,
} = require("../../helpers/formattedNumberWithPadding");
const Income = require("../../models/Income");

router.get("/", [auth, isCompanyAdmin], async (req, res) => {
  return res.status(200).send("Quotation API Running");
});

// @route    POST api/quotes
// @desc     Create a new quotation
// @access   Private
// steps to create a quotation are:
// 1. if client is already exist will use client id
// 2. if client is not exist will create a new client and use client id
// 3. we will create new project every time we create a new quotation
// we should create a general terms and conditions array (terms collection) in text will be picked in the front end

// we will separate creation functions so we can focus on debugging and testing
// if we create them all in one function that will be messy and hard to debug

// create a new client
const createClient = async (
  firstName,
  lastName,
  email,
  phone,
  companyName,
  companyLogo,
  companyEmail,
  companyWebsite,
  country,
  position
) => {
  // create a new client

  // getting client number
  const startingClientNumber = 32; // number of clients created before the system;

  // getting stored clients
  const clients = await Clients.find();
  const nextClientNumber = startingClientNumber + parseInt(clients.length) + 1; // Determine the next client number

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

  return clientId;
};

// create a new project
const createNewProject = async (
  title,
  description,
  projectType,
  startDate,
  timeLine,
  client,
  totalPrice,
  projectUrl // Ensure this variable is correctly named and passed
) => {
  if (!projectUrl) {
    throw new Error("Project URL is required and cannot be null or undefined.");
  }

  // Check if project already exists
  const projectExist = await Projects.findOne({ projectUrl });

  if (projectExist) {
    return projectExist._id; // Return early if the project exists
  } else {
    // Determine the next project number
    const startingProjectNumber = 12; // Number of projects created before the system
    const projects = await Projects.find();
    const nextProjectNumber = startingProjectNumber + projects.length + 1;
    const projectNumber = formattedNumberWithPadding(nextProjectNumber);

    // Create the new project
    const newProject = new Project({
      title,
      description,
      projectType,
      startDate: parseDate(startDate),
      endDate: calculateEndDate(parseDate(startDate), timeLine), // Calculating end date
      projectNumber,
      timeLine,
      client,
      totalPrice,
      projectUrl, // Use the correctly named and validated project URL
    });

    const savedProject = await newProject.save();
    return savedProject._id;
  }
};

// create new income record
const createIncome = async (
  amount,
  description,
  project,
  client,
  quotation,
  invoice,
  status,
  type,
  paidAmount,
  remainingAmount
) => {
  const newIncome = new Income({
    amount,
    description,
    project,
    client,
    quotation,
    invoice,
    status,
    type,
    paidAmount,
    remainingAmount,
  });

  await newIncome.save();
};

router.post("/", [auth, isCompanyAdmin], async (req, res) => {
  const {
    clientId,
    projectTitle,
    projectDescription,
    projectType,
    projectStartDate,
    projectPrice,
    projecturl,
    clientFirstName,
    clientLastName,
    clientEmail,
    clientPhone,
    clientCompanyName,
    clientCompanyLogo,
    clientComapnyEmail,
    clientCompanyWebsite,
    clientCountry,
    clientPosition,
    quotationItems,
    totalDiscount,
    overview,
    overviewItems,
    customerResponsibilities,
    timeLine,
    commitments,
    termsAndConditions,
    paymentTerms,
    amountPaid,
    notes,
  } = req.body;

  // start by getting quotation number
  const startingNumber = 23; // number of quotations created before the system;

  try {
    // getting stored quotations
    const quotations = await Quotation.find();
    const nextNumber = startingNumber + parseInt(quotations.length) + 1; // Determine the next quotation number

    const quotationNumber = formattedNumberWithPadding(nextNumber);

    // first create a new client if not exist
    // second create a new project and update project record to the client
    // third create a new quotation
    // forth create a new income record

    let clientIdToUse;

    if (clientId) {
      // if client id is provided
      clientIdToUse = clientId;
    } else if (clientEmail) {
      // if client email is provided
      const client = await Client.findOne({ email: clientEmail });

      if (client) {
        clientIdToUse = client._id;
      } else {
        clientIdToUse = await createClient(
          clientFirstName,
          clientLastName,
          clientEmail,
          clientPhone,
          clientCompanyName,
          clientCompanyLogo,
          clientComapnyEmail,
          clientCompanyWebsite,
          clientCountry,
          clientPosition
        );
      }
    }

    // create a new project and get project id
    const projectId = await createNewProject(
      projectTitle,
      projectDescription,
      projectType,
      projectStartDate,
      timeLine,
      clientIdToUse,
      projectPrice,
      projecturl
    );

    await Clients.updateOne(
      { _id: clientIdToUse },
      {
        $addToSet: { projects: projectId },
      }
    );

    // check if quotation exists
    const quotationExist = await Quotation.findOne({ project: projectId });

    if (quotationExist) {
      return res.status(500).send({
        error: "Quotation already exists",
        message: `Quotation already exists for this project under number ${quotationExist.quotationNumber}`,
      });
    }

    const validUntil = calculateEndDate(parseDate(projectStartDate), 21); // calculating valid until date

    const newQuotation = new Quotation({
      quotationNumber,
      project: projectId,
      client: clientIdToUse,
      validUntil,
      quotationItems,
      totalDiscount,
      title: projectTitle,
      description: projectDescription,
      projectType,
      startDate: parseDate(projectStartDate),
      endDate: calculateEndDate(parseDate(projectStartDate), timeLine),
      totalPrice: projectPrice,
      overview,
      overviewItems,
      customerResponsibilities,
      timeLine,
      commitments,
      termsAndConditions,
      paymentTerms,
      amountPaid,
      notes,
    });

    await Quotation.insertMany(newQuotation);

    // after creating quoation we will create a possible income record

    await createIncome(
      projectPrice,
      projectDescription,
      projectId,
      clientIdToUse,
      newQuotation._id,
      null,
      "Pending",
      "Possible",
      0,
      projectPrice
    );

    return res.status(200).send({
      message: `Quotation created successfully under number ${quotationNumber}`,
    });
  } catch (error) {
    return res.status(500).send({
      error: "Error",
      message: error.message,
    });
  }
});

module.exports = router;
