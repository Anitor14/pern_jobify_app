const CustomError = require("../errors");

const checkPermissions = (requestUser, resourceUserId) => {
  if (requestUser.userId === resourceUserId) return;
  throw new CustomError.UnauthenticatedError(
    "Not authorized access this route."
  );
};

module.exports = { checkPermissions };
