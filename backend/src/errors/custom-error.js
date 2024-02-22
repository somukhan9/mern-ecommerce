class CustomAPIError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode

    // Error.captureStackTrace(this, this.constructor)
  }
}

const createCustomError = (statusCode, message) => {
  return new CustomAPIError(statusCode, message)
}

module.exports = { createCustomError, CustomAPIError }
