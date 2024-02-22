const router = require('express').Router()

const {
  getAllProducts,
  createProduct,
  getSingleProductDetails,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteProductReview,
} = require('../controllers/product-controller')

const {
  isAuthenticated,
  authorizeRole,
} = require('../middlewares/auth-middleware')

// Get all the products
router.route('/products').get(getAllProducts)

// Get single product details
router.route('/product/:id').get(getSingleProductDetails)

// Create a product --> Admin
router
  .route('/admin/product')
  .post(isAuthenticated, authorizeRole('admin'), createProduct)

// Update and Delete a product --> Admin
router
  .route('/admin/product/:id')
  .put(isAuthenticated, authorizeRole('admin'), updateProduct)
  .delete(isAuthenticated, authorizeRole('admin'), deleteProduct)

// Get all the reviews of a product
router.route('/product-reviews').get(getProductReviews)

// Create or Update and Delete product review --> User
router
  .route('/product-review')
  .put(isAuthenticated, createProductReview)
  .delete(isAuthenticated, deleteProductReview)

module.exports = router
