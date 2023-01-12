const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { User } = require("../models");
const {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  createTokenUser,
} = require("../utils");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new CustomError.BadRequestError("please provide all values");
  }

  const userAlreadyExists = await User.findOne({ where: { email } });

  if (userAlreadyExists) {
    throw new CustomError.BadRequestError("Email is already in use");
  }
  const user = await User.create({ name, email, password });
  // create a tokenUser from the user.
  const tokenUser = createTokenUser(user);
  // attaching cookies to response
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: user });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("please provide email and password");
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new CustomError.UnauthenticatedError("this user does not exist");
  }

  // compare password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("invalid Credentials");
  }

  const tokenUser = createTokenUser(user);
  // attaching cookies to response
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: user });
};

const updateUser = async (req, res) => {
  res.send("update User");
};

const getCurrentUser = async (req, res) => {
  res.send("get current user");
};

const logout = async (req, res) => {
  res.send("logout user");
};

module.exports = {
  register,
  login,
  updateUser,
  getCurrentUser,
  logout,
};
