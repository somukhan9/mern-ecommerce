const status = require('http-status')
const Product = require('../models/Product')
const asyncWrapper = require('../middlewares/async-wrapper')
const { createCustomError } = require('../errors/custom-error')
const ProductAPIFeature = require('../utils/product-api-feature')

// Get All the Products
const getAllProducts = asyncWrapper(async (req, res) => {
  const productAPIFeature = new ProductAPIFeature(Product.find(), req.query)
    .search()
    .filter()
    .pagination()

  const products = await productAPIFeature.query
  res.status(status.OK).json({ success: true, products })
})

// Get Single Product Details
const getSingleProductDetails = asyncWrapper(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(createCustomError(status.NOT_FOUND, 'Product not found.'))
  }

  res.status(status.OK).json({ success: true, product })
})

// Create Products --> Admin Route
const createProduct = asyncWrapper(async (req, res) => {
  req.body.user = req.user._id
  const product = await Product.create(req.body)
  res.status(status.CREATED).json({ success: true, product })
})

// Update Products --> Admin Route
const updateProduct = asyncWrapper(async (req, res) => {
  let product = await Product.findById(req.params.id)

  if (!product) {
    return next(createCustomError(status.NOT_FOUND, 'Product not found.'))
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndUpdate: false,
  })

  res.status(status.OK).json({ success: true, product })
})

// Delete Products --> Admin Route
const deleteProduct = asyncWrapper(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(createCustomError(status.NOT_FOUND, 'Product not found.'))
  }

  await Product.deleteOne({ _id: req.params.id })

  res
    .status(status.OK)
    .json({ success: true, message: 'Product deleted successfully.' })
})

// Create new review or update review of a product
const createProductReview = asyncWrapper(async (req, res, next) => {
  const { rating, comment, productID } = req.body

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  }

  if (!review.rating || !review.comment) {
    return next(
      createCustomError(
        status.BAD_REQUEST,
        'Please provide rating and comment for review'
      )
    )
  }

  const product = await Product.findById(productID)

  if (!product) {
    return next(createCustomError(status.NOT_FOUND, 'Product not found'))
  }

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  )

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = Number(rating)
        rev.comment = comment
      }
    })
  } else {
    product.reviews.push(review)
    product.numberOfReviews = product.reviews.length
  }

  let avg = 0
  product.reviews.forEach((rev) => {
    avg += rev.rating
  })

  product.ratings = avg / product.reviews.length

  await product.save({ validateBeforeSave: false })

  res.status(status.OK).json({ success: true, product })
})

// Get all the reviews of a product
const getProductReviews = asyncWrapper(async (req, res, next) => {
  const { productID } = req.query

  const product = await Product.findById(productID)

  if (!product) {
    return next(createCustomError(status.NOT_FOUND, 'Product not found'))
  }

  res.status(status.OK).json({ success: true, reviews: product.reviews })
})

// Delete review from a product
const deleteProductReview = asyncWrapper(async (req, res, next) => {
  const { productID, reviewID } = req.query

  let product = await Product.findById(productID)

  if (!product) {
    return next(createCustomError(status.NOT_FOUND, 'Product not found'))
  }

  // Ensuring whether the logged in user has created the review or not
  const isUserAllowedToDeleteTheReview = product.reviews.find((rev) => {
    if (rev._id.toString() === reviewID.toString()) {
      if (rev.user.toString() === req.user._id.toString()) {
        return rev
      }
    }
  })

  // If the logged in user has not created the review send Error
  if (!isUserAllowedToDeleteTheReview) {
    return next(
      createCustomError(
        status.UNAUTHORIZED,
        `${req.user.email} is not allowed to delete this review`
      )
    )
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== reviewID.toString()
  )

  let avg = 0
  reviews.forEach((rev) => {
    avg += rev.rating
  })

  let ratings = 0

  if (reviews.length === 0) {
    ratings = 0
  } else {
    ratings = avg / reviews.length
  }

  const numberOfReviews = reviews.length

  product = await Product.findByIdAndUpdate(
    productID,
    {
      ratings,
      reviews,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndUpdate: false,
    }
  )

  res.status(status.OK).json({
    success: true,
    product,
  })
})

module.exports = {
  getAllProducts,
  getSingleProductDetails,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteProductReview,
}
