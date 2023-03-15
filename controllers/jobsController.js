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
  const { search, status, jobType, sort } = req.query;

  const queryObject = {
    where: { createdBy: req.user.userId },
  };

  if (search) {
    queryObject.where.position = { [Op.iLike]: `%${search}%` };
  }
  if (status !== "all") {
    queryObject.where.status = status;
  }
  if (jobType !== "all") {
    queryObject.where.jobType = jobType;
  }

  let order = [];

  if (sort === "latest") {
    order.push(["createdAt", "DESC"]);
  }
  if (sort === "oldest") {
    order.push(["createdAt", "ASC"]);
  }
  if (sort === "a-z") {
    order.push(["position", "ASC"]);
  }
  if (sort === "z-a") {
    order.push(["position", "DESC"]);
  }

  if (order.length) {
    queryObject.order = order;
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  queryObject.limit = limit;
  queryObject.offset = offset;
  const { rows: jobs, count: totalJobs } = await Jobs.findAndCountAll(
    queryObject
  );
  const numOfPages = Math.ceil(totalJobs / limit);
  // const queryObject = { createdBy: req.user.userId };

  // if (status !== "all") {
  //   queryObject.status = status;
  // }

  // if (jobType !== "all") {
  //   queryObject.jobType = jobType;
  // }

  // if (search) {
  //   queryObject.position = { $regex: search, $options: "i" };
  // }

  // let result = Jobs.findAll({ where: queryObject });

  // //chain sort conditions.
  // if (sort === "latest") {
  //   result = Jobs.findAll({
  //     where: queryObject,
  //     order: [["createdAt", "ASC"]],
  //   });
  // }
  // if (sort === "oldest") {
  //   result = Jobs.findAll({
  //     where: queryObject,
  //     order: [["createdAt", "DESC"]],
  //   });
  // }
  // if (sort === "a-z") {
  //   result = Jobs.findAll({ where: queryObject, order: [["position", "ASC"]] });
  // }
  // if (sort === "z-a") {
  //   result = Jobs.findAll({
  //     where: queryObject,
  //     order: [["position", "DESC"]],
  //   });
  // }

  // // setup pagination.
  // // const page = Number(req.query.page) || 1;
  // // const limit = Number(req.query.limit) || 1;

  // const page = req.query.page || 1;
  // const limit = req.query.limit || 1;
  // console.log('reached here ')
  // const { limitNumber, offset } = getPagination({ page, limit });
  // console.log( limitNumber, offset)

  // const { count: totalJobs, rows: jobs } = await Jobs.findAndCountAll({
  //   limit,
  //   offset,
  // });

  // const { numOfPages, currentpage } = getPagingData({
  //   limit,
  //   page,
  //   totalJobs,
  // });

  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
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

//delete job
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

//show stats
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

// upload image ToDigitalOcean
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
