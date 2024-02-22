const status = require('http-status')
const jwt = require('jsonwebtoken')
const { createCustomError } = require('../errors/custom-error')
const asyncWrapper = require('./async-wrapper')
const User = require('../models/User')

const isAuthenticated = asyncWrapper(async (req, res, next) => {
  const { token } = req.cookies

  if (!token) {
    return next(
      createCustomError(status.UNAUTHORIZED, 'You are not authenticated')
    )
  }

  const { id: userID } = jwt.verify(token, process.env.JWT_SECRET)
  req.user = await User.findById(userID)

  next()
})

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        createCustomError(
          status.FORBIDDEN,
          `Role: ${req.user.role} is not allowed to access this resouce`
        )
      )
    }
    next()
  }
}

module.exports = { isAuthenticated, authorizeRole }
