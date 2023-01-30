const express = require("express");
const router = express.Router();

const {
  createJob,
  getAllJobs,
  updateJob,
  deleteJob,
} = require("../controllers/jobsController");

const { authenticateUser } = require("../middleware/auth");

router.route("/createJob").post(authenticateUser, createJob);
router.route("/getAllJobs").get(authenticateUser, getAllJobs);
router.route("/updateJob/:id").patch(authenticateUser, updateJob);
router.route("/deleteJob/:id").delete(authenticateUser, deleteJob);

module.exports = router;
