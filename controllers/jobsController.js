const { StatusCodes } = require("http-status-codes");
const { where } = require("sequelize");
const CustomError = require("../errors");
const { Jobs } = require("../models");
const { getPagination, getPagingData } = require("../utils");

const createJob = async (req, res) => {
  const { position, company } = req.body;

  if (!position || !company) {
    throw new CustomError.BadRequestError("please provide all values");
  }

  req.body.createdBy = req.user.userId;
  const job = await Jobs.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

// const getAllJobs = async (req, res) => {
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

module.exports = { createJob, getAllJobs };
