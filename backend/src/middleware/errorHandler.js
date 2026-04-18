function errorHandler(error, req, res, next) {
  console.error(error);
  if (error.message === "Database connection has not been initialized.") {
    res.status(503).json({ success: false, message: "Database is still connecting. Please retry shortly." });
    return;
  }

  res.status(500).json({ success: false, message: "Internal server error" });
}

module.exports = errorHandler;
