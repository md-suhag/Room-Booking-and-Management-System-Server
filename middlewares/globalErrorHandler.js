const AppError = require("../utils/appError.js");

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // Wrong MongoDB ID error (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found with this id. Invalid ${err.path}`;
    err = new AppError(message, 400);
  }

  // Duplicate key error (MongoDB)
  if (err.code === 11000) {
    const message = `Duplicate key ${Object.keys(err.keyValue)} entered`;
    err = new AppError(message, 400);
  }

  // Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `Invalid token. Please try again later.`;
    err = new AppError(message, 400);
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    const message = `Your token has expired. Please try again later.`;
    err = new AppError(message, 400);
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err?.stack : null,
    error: err,
  });
};

module.exports = globalErrorHandler;
