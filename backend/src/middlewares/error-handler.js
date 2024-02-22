const status = require('http-status')
const { createCustomError } = require('../errors/custom-error')

const errorHandlerMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || status.INTERNAL_SERVER_ERROR
  err.message = err.message || 'Internal Server Error.'

  // if (err instanceof CustomAPIError) {
  //   // message = err.message
  //   err = createCustomError(err.statusCode, err.message)
  // }

  // Wrong MongoDB ID Error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid ${err.path}`
    err = createCustomError(status.BAD_REQUEST, message)
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    const message = `Account aleady exists with email: ${req.body.email}`
    err = createCustomError(status.BAD_REQUEST, message)
  }

  // Wrong JWT Error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Json Web Token is invalid. Please try again'
    err = createCustomError(status.BAD_REQUEST, message)
  }

  // JWT Expired Error
  if (err.name === 'TokenExpiredError') {
    const message = 'Json Web Token is expired. Please try again'
    err = createCustomError(status.BAD_REQUEST, message)
  }

  res.status(err.statusCode).json({ success: false, message: err.message })
}

module.exports = errorHandlerMiddleware
