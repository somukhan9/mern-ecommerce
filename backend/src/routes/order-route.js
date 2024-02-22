const router = require('express').Router()

const {
  isAuthenticated,
  authorizeRole,
} = require('../middlewares/auth-middleware')

const {
  createNewOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/order-controller')

// Create new order
router.route('/order/new').post(isAuthenticated, createNewOrder)

// Get single order
router.route('/order/:id').get(isAuthenticated, getSingleOrder)

// Get logged in user's order
router.route('/orders/me').get(isAuthenticated, myOrders)

// Get all orders --> Admin
router
  .route('/admin/orders')
  .get(isAuthenticated, authorizeRole('admin'), getAllOrders)

// Update order status and Delete a order --> Admin
router
  .route('/admin/order/:id')
  .put(isAuthenticated, authorizeRole('admin'), updateOrderStatus)
  .delete(isAuthenticated, authorizeRole('admin'), deleteOrder)

module.exports = router
