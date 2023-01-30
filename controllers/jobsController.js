const { StatusCodes } = require("http-status-codes");
const { where } = require("sequelize");
const CustomError = require("../errors");
const { Jobs } = require("../models");
const { getPagination, getPagingData, checkPermissions } = require("../utils");

const createJob = async (req, res) => {
  const { position, company } = req.body;

  if (!position || !company) {
    throw new CustomError.BadRequestError("please provide all values");
  }

  req.body.createdBy = req.user.userId;
  const job = await Jobs.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

// const getAllUsers = async (req, res) => {
//   const { number, size } = req.query;

//   // checking if the size and the number of pages are available.
//   const pageNumber = number ? number : 1;
//   const pageSize = size ? size : 3;

//   const { limit, offset } = getPagination({ pageNumber, pageSize });

//   console.log(limit, offset);

//   const { count: totalUsers, rows: users } = await Jobs.findAndCountAll({
//     limit,
//     offset,
//   });

//   const { totalPages, currentPage } = getPagingData({
//     limit,
//     pageNumber,
//     totalUsers,
//   });

//   res.json({ totalUsers, users, totalPages, currentPage });
// };

const getAllJobs = async (req, res) => {
  const jobs = await Jobs.findAll({
    where: { createdBy: req.user.userId },
  });

  res
    .status(StatusCodes.OK)
    .json({ jobs, totalJobs: jobs.length, numOfPages: 1 });
};

// update job.
const updateJob = async (req, res) => {
  const { id: jobId } = req.params;
  const { company, position, jobLocation } = req.body;

  if (!position || !company) {
    throw new CustomError.BadRequestError("Please provide all values.");
  }
  // getting the job with id = jobId.
  const job = await Jobs.findOne({ where: { id: jobId } });

  if (!job) {
    throw new CustomError.NotFoundError(`No Job  with id: ${jobId}`);
  }
  console.log(req.user, job.createdBy);
  checkPermissions(req.user, job.createdBy);

  await job.update({ company, position, jobLocation });

  res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
  const { id: jobId } = req.params;
  const job = await Jobs.findOne({ where: { id: jobId } });
  if (!job) {
    throw new CustomError.NotFoundError(`No job with id : ${jobId}`);
  }
  console.log("we are here.");
  console.log(req.user, job.createdBy);
  checkPermissions(req.user, job.createdBy);
  await job.destroy();
  res.status(StatusCodes.OK).json({ msg: "Success! job removed." });
};

module.exports = { createJob, getAllJobs, updateJob, deleteJob };
