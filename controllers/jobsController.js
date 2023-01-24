const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { Jobs } = require("../models");

const createJob = async (req, res) => {
  const { position, company } = req.body;

  if (!position || !company) {
    throw new CustomError.BadRequestError("please provide all values");
  }

  req.body.createdBy = req.user.userId;
  const job = await Jobs.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

module.exports = { createJob };
