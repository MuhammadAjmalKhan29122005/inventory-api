const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Postgres unique violation (duplicate SKU)
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'SKU already exists' });
  }

  // Postgres not-null violation
  if (err.code === '23502') {
    return res.status(400).json({ success: false, message: 'Missing required field' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;