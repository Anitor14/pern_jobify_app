const express = require("express");
const router = express.Router();

const { createJob, getAllJobs } = require("../controllers/jobsController");

const { authenticateUser } = require("../middleware/auth");

router.route("/createJob").post(authenticateUser, createJob);
router.route("/getAllJobs/").get(authenticateUser, getAllJobs);

module.exports = router;
