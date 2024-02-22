const router = require('express').Router()

const {
  isAuthenticated,
  authorizeRole,
} = require('../middlewares/auth-middleware')

const {
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
} = require('../controllers/user-controller')

// Create a user account
router.route('/register').post(resgiterUser)

// Login User
router.route('/login').post(loginUser)

// Logout user
router.route('/logout').get(logoutUser)

// Request for forgot password
router.route('/password/forgot').post(forgotPassword)

// Reset password
router.route('/password/reset/:token').put(resetPassword)

// Update password of logged in user
router.route('/password/update').put(isAuthenticated, updatePassword)

// Get the logged in user details
router.route('/me').get(isAuthenticated, getUserDetails)

// Update the profile of logged in user
router.route('/me/update').put(isAuthenticated, updateProfile)

// Get all the users --> Admin
router
  .route('/admin/users')
  .get(isAuthenticated, authorizeRole('admin'), getAllUsers)

// Get single user details, Update user role and, Delete a user  --> Admin
router
  .route('/admin/user/:id')
  .get(isAuthenticated, authorizeRole('admin'), getSingleUser)
  .put(isAuthenticated, authorizeRole('admin'), updateUserRole)
  .delete(isAuthenticated, authorizeRole('admin'), deleteUser)

module.exports = router
