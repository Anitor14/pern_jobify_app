const getPagination = ({ pageNumber, pageSize }) => {
  const limit = pageSize;
  const offset = (pageNumber - 1) * pageSize;

  return { limit, offset }; 
};

const getPagingData = ({ limit, pageNumber, totalUsers }) => {
  const totalPages = Math.ceil(totalUsers / limit);
  const currentPage = pageNumber ? +pageNumber : 0;
  return { totalPages, currentPage };
};

module.exports = { getPagination, getPagingData };

  //   const limit = size ? +size : 3;
  //   const offset = page ? page * limit : 0;