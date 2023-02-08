const { StatusCodes } = require("http-status-codes");
const path = require("path");
const Sequelize = require("sequelize");
// const sequelize = new Sequelize(...);
// const { fn } = require("fn");
const CustomError = require("../errors");
const Joi = require("joi");

const AWS = require("aws-sdk");
const fs = require("fs");
const spacesEndpoint = new AWS.Endpoint("fra1.digitaloceanspaces.com");

// const s3 = new AWS.S3({
//   endpoint: spacesEndpoint,
//   accessKeyId: process.env.DO_SPACES_KEY,
//   secretAccessKey: process.env.DO_SPACES_SECRET,
// });
AWS.config.update({
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
  endpoint: spacesEndpoint,
});

const s3 = new AWS.S3();
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

const showStats = async (req, res) => {
  const stats = await Jobs.findAll({
    where: { createdBy: req.user.userId },
    attributes: ["status", [Sequelize.fn("COUNT", "status"), "count"]],
    group: ["status"],
  });

  // stats = stats.reduce((acc, curr) => {
  //   const { id: title, count } = curr;
  //   acc[title] = count;
  //   return acc;
  // }, {});
  // const defaultStats = {
  //   pending: stats.pending || 0,
  //   interview: stats.interview || 0,
  //   declined: stats.declined || 0,
  // };

  let monthlyApplications = [];
  res.status(StatusCodes.OK).json({ defaultStats: stats, monthlyApplications });
};

const uploadImageToDigitalOcean = async (req, res) => {
  //image validation.
  const imageSchema = Joi.object({
    image: Joi.object({
      // mimetype: Joi.string().valid("image/jpeg").required(),
      size: Joi.number()
        .max(2 * 1024 * 1024)
        .required(),
      name: Joi.string(),
    }),
  }).options({ allowUnknown: true });

  const imageValidateResult = imageSchema.validate(req.files);

  if (imageValidateResult.error) {
    return res.status(400).send(imageValidateResult.error.message);
  }
  const { image } = req.files;
  const file = fs.readFileSync(image.tempFilePath);
  // converting it to base64.
  // const base64File = file.toString("base64");
  // console.log(base64File)
  // const imageName = path.join(
  //   __dirname,
  //   "../public/uploads/" + `${image.name}`
  // );
  const imageName = image.name;
  console.log(imageName);
  s3.upload(
    {
      Bucket: process.env.DO_SPACES_NAME,
      // Key: image.tempFilePath,
      Key: imageName,
      Body: file,
      ACL: "public-read",
    }
    // (err, data) => {
    //   if (err) return console.log(err);
    //   console.log("Your file has been uploaded successfully!", data);
    // }
  ).send((err, data) => {
    if (err) return res.status(500);
    // Unlink file
    fs.unlinkSync(image.tempFilePath);
    // Return file url or other necessary details
    return res.send({
      url: data.Location,
    });
  });
  // fs.unlinkSync(image.tempFilePath);
  // //checking if the bucket exists.
  // s3.headBucket({ Bucket: process.env.DO_SPACES_NAME }, (err, data) => {
  //   if (err) return console.log(err);
  //   console.log("bucket exists");
  // });
  // return res.json({
  //   message: "file uploaded successfully",
  //   // file: `${process.env.DO_SPACES_ENDPOINT}/${imageName} `,
  // });
};

module.exports = {
  createJob,
  getAllJobs,
  updateJob,
  deleteJob,
  showStats,
  uploadImageToDigitalOcean,
};
