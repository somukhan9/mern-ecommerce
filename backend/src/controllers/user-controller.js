const status = require('http-status')
const crypto = require('crypto')

const asyncWrapper = require('../middlewares/async-wrapper')
const { createCustomError } = require('../errors/custom-error')
const User = require('../models/User')
const sendToken = require('../utils/jwt-token')
const sendEmail = require('../utils/send-email')

// Resgister User
const resgiterUser = asyncWrapper(async (req, res, next) => {
  const { name, email, password } = req.body

  const user = await User.create({
    name,
    email,
    password,
    avatar: { publicID: 'Sample ID', url: 'Sample Url' },
  })

  sendToken(user, status.CREATED, res)
})

// Login User
const loginUser = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body

  if ((!email, !password)) {
    return next(
      createCustomError(
        status.BAD_REQUEST,
        'Please enter your email and password'
      )
    )
  }

  const user = await User.findOne({ email: email }).select('+password')

  if (!user) {
    return next(
      createCustomError(status.UNAUTHORIZED, 'Invalid email or password')
    )
  }

  const isPasswordMatched = await user.comparePassword(password)

  if (!isPasswordMatched) {
    return next(
      createCustomError(status.UNAUTHORIZED, 'Invalid email or password')
    )
  }

  sendToken(user, status.OK, res)
})

// Logout User
const logoutUser = (req, res) => {
  const options = {
    expires: new Date(Date.now()),
    httpOnly: true,
  }
  res.cookie('token', null, options)
  req.user = null

  res.status(status.OK).json({ success: true, message: 'Logged Out' })
}

// Forgot User
const forgotPassword = asyncWrapper(async (req, res, next) => {
  const { email } = req.body

  if (!email) {
    return next(
      createCustomError(
        status.BAD_REQUEST,
        'Please enter the email by which you have created your account'
      )
    )
  }

  const user = await User.findOne({ email })

  if (!user) {
    return next(
      createCustomError(
        status.NOT_FOUND,
        `No account has created with ${email}`
      )
    )
  }

  const resetToken = user.getResetPasswordToken()
  await user.save({ validateBeforeSave: false })

  const resetPasswordUrl = `${req.protocol}://${req.get(
    'host'
  )}/auth/password/reset/${resetToken}`

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email, please ignore it.`

  try {
    await sendEmail({
      email,
      subject: `MERN Ecommerce Forgot Password`,
      message,
    })

    res
      .status(status.OK)
      .json({ success: true, message: `Email has sent to ${email}` })
  } catch (error) {
    this.resetPasswordToken = undefined
    this.resetPasswordTokenExpire = undefined
    await user.save({ validateBeforeSave: false })

    console.log(error.message)

    next(createCustomError(status.INTERNAL_SERVER_ERROR, error.message))
  }
})

// Reset Password
const resetPassword = asyncWrapper(async (req, res, next) => {
  const { password, confirmPassword } = req.body
  const { token } = req.params

  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordTokenExpire: { $gt: Date.now() },
  })

  if (!user) {
    return next(
      createCustomError(
        status.BAD_REQUEST,
        'Reset Password Token is invalid or has been expired'
      )
    )
  }

  if (password !== confirmPassword) {
    return next(createCustomError(status.BAD_REQUEST, 'Password did not match'))
  }

  user.password = password
  user.resetPasswordToken = undefined
  user.resetPasswordTokenExpire = undefined

  await user.save()

  sendToken(user, status.OK, res)
})

// Get User Details
const getUserDetails = asyncWrapper(async (req, res, next) => {
  const { _id: userID } = req.user
  const user = await User.findById(userID)
  res.status(status.OK).json({ success: true, user })
})

// Update User Password
const updatePassword = asyncWrapper(async (req, res, next) => {
  const { _id: userID } = req.user
  const { oldPassword, newPassword, confirmPassword } = req.body

  const user = await User.findById(userID).select('+password')

  if (!user) {
    return next(createCustomError(status.NOT_FOUND)).json({
      success: false,
      message: 'User not found',
    })
  }

  const isPasswordMatched = await user.comparePassword(oldPassword)

  if (!isPasswordMatched) {
    return next(
      createCustomError(status.BAD_REQUEST, 'Old password is incorrect')
    )
  }

  if (newPassword !== confirmPassword) {
    return next(createCustomError(status.BAD_REQUEST, 'Password did not match'))
  }

  user.password = newPassword
  await user.save()
  sendToken(user, status.OK, res)
})

// Update User Profile
const updateProfile = asyncWrapper(async (req, res, next) => {
  const { _id: userID } = req.user

  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  }

  // TODO:
  // Cloudinary image handling

  let user = await User.findById(userID)

  if (!user) {
    return next(createCustomError(status.NOT_FOUND, 'User not found'))
  }

  user = await User.findByIdAndUpdate(userID, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })

  res.status(status.OK).json({ success: true, user })
})

// Get all the users --> Admin
const getAllUsers = asyncWrapper(async (req, res, next) => {
  const users = await User.find()

  res.status(status.OK).json({ success: true, users })
})

// Get single user details --> Admin
const getSingleUser = asyncWrapper(async (req, res, next) => {
  const { id: userID } = req.params

  const user = await User.findById(userID)

  if (!user) {
    return next(createCustomError(status.NOT_FOUND, 'User not found'))
  }

  res.status(status.OK).json({ success: true, user })
})

// Update user role --> Admin
const updateUserRole = asyncWrapper(async (req, res, next) => {
  const { id: userID } = req.params
  const { role } = req.body

  if (!role) {
    return next(
      createCustomError(status.BAD_REQUEST, 'Please enter the user role')
    )
  }

  let user = await User.findById(userID)

  if (!user) {
    return next(createCustomError(status.NOT_FOUND, 'User not found'))
  }

  user = await User.findByIdAndUpdate(
    userID,
    { role: role },
    { new: true, runValidators: true, useFindAndModify: false }
  )

  res.status(status.OK).json({ success: true, user })
})

// Delete a user --> Admin
const deleteUser = asyncWrapper(async (req, res, next) => {
  const { id: userID } = req.params

  const user = await User.findById(userID)

  if (!user) {
    return next(createCustomError(status.NOT_FOUND, 'User not found'))
  }

  await User.findByIdAndDelete(userID)

  res
    .status(status.OK)
    .json({ success: true, message: 'User deleted successfully' })
})

module.exports = {
  resgiterUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
}
