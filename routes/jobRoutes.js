const express = require("express");
const router = express.Router();

const { createJob } = require("../controllers/jobsController");

const { authenticateUser } = require("../middleware/auth");

router.route("/createJob").post(authenticateUser, createJob);

module.exports = router;
