const notFound = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  console.error(err.message);
  res.status(status).json({
    message: status < 500 ? err.message : 'Something went wrong. Please try again',
  });
};

module.exports = { notFound, errorHandler };