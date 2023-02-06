require("dotenv").config();
require("express-async-errors");
const express = require("express");
const { sequelize } = require("./models");

// rest of the packages
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const app = express();

//routers
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");

//middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

// to access middleware we use app.use().
// app.use(morgan("tiny"));
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use(express.json()); //we want to have access to the json data in our req.body.
app.use(fileUpload({ useTempFiles: true }));
app.use(cookieParser(process.env.JWT_SECRET)); // enables us to have access to cookies in the req.cookies.

app.use(express.static("./public")); // this would make the public folder available.

// app.use(fileUpload());
app.get("/", (req, res) => {
  res.send("jobify application");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);
//routers

//middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

app.listen(port, async () => {
  console.log(`Server is listening on port ${port}...`);
  await sequelize.authenticate(); // creates database tables in our database with reference to our models.
  console.log("Database Connected");
});
