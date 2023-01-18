// this is middleware for the auth.js
const CustomError = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  // we check for signed cookies from the request.
  const token = req.signedCookies.token;
  console.log("this is the token" + token);
  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }

  try {
    const payload = isTokenValid({ token });
    const { name, userId } = payload;
    console.log(userId);
    req.user = { name, userId };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
};

module.exports = {
  authenticateUser,
};
