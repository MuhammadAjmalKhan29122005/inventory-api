const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

const logInventoryUpdate = (action, product) => {
  console.log(
    `[INVENTORY ${action}] ${new Date().toISOString()} - ID: ${product.id}, Name: ${product.name}, SKU: ${product.sku}, Quantity: ${product.quantity}`
  );
};

module.exports = { requestLogger, logInventoryUpdate };