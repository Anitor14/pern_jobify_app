const createTokenUser = (user) => {
  return { name: user.name, userId: user.id };
};

module.exports = createTokenUser;
