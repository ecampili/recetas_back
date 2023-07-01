const errorHandler = (err, req, res, next) => {
  console.log(err);
  const status = err.status || 500;
  res.status(status);
  res.send({
    error: true,
    status,
    message: err.message || "Internal Server error",
  });
};
module.exports = errorHandler;
