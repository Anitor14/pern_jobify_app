const express = require("express");
const router = express.Router();

const rateLimiter = require("express-rate-limit");
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

const {
  register,
  login,
  updateUser,
  getCurrentUser,
  logout,
} = require("../controllers/authcontroller");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);

router.route("/updateUser").patch(updateUser);
router.route("/getCurrentUser").get(getCurrentUser);

module.exports = router;