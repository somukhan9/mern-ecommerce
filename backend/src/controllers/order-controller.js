const status = require('http-status')

const Order = require('../models/Order')
const Product = require('../models/Product')
const asyncWrapper = require('../middlewares/async-wrapper')
const { createCustomError } = require('../errors/custom-error')
const { checkStock, updateStock } = require('../utils/handle-product-stock')

// Create new order
const createNewOrder = asyncWrapper(async (req, res, next) => {
  const { orderItems, taxPrice, shippingPrice } = req.body
  let itemsPrice = 0
  let totalPrice = 0

  let checkStockObj = { isStockAvailable: true, product: null, quantity: 0 }

  checkStockObj = await checkStock(orderItems)

  if (checkStockObj && !checkStockObj.isStockAvailable) {
    return next(
      createCustomError(
        status.BAD_REQUEST,
        `${checkStockObj.product.name} has stock of ${checkStockObj.product.stock} but requested for ${checkStockObj.quantity}`
      )
    )
  }

  orderItems.forEach((item) => {
    itemsPrice += item.price
  })

  totalPrice = itemsPrice + taxPrice + shippingPrice

  const order = await Order.create({
    ...req.body,
    itemsPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  })

  res.status(status.CREATED).json({ success: true, order })
})

// Get single order
const getSingleOrder = asyncWrapper(async (req, res, next) => {
  const { id: orderID } = req.params

  const order = await Order.findById(orderID).populate('user', 'name email')

  if (!order) {
    return next(createCustomError(status.NOT_FOUND, 'Order not found'))
  }

  res.status(status.OK).json({ success: true, order })
})

// Get logged in user's orders
const myOrders = asyncWrapper(async (req, res, next) => {
  const { _id: userID } = req.user
  const orders = await Order.find({ user: userID })

  res.status(status.OK).json({ success: true, orders })
})

// Get all orders --> Admin
const getAllOrders = asyncWrapper(async (req, res, next) => {
  const orders = await Order.find()

  let totalAmount = 0

  orders.forEach((item) => {
    totalAmount += item.totalPrice
  })

  res.status(status.OK).json({ success: true, totalAmount, orders })
})

// Update order status --> Admin
const updateOrderStatus = asyncWrapper(async (req, res, next) => {
  const { id: orderID } = req.params
  const { status: orderStatus } = req.body

  if (orderStatus !== 'Shipped' && orderStatus !== 'Delivered') {
    return next(
      createCustomError(
        status.BAD_REQUEST,
        'Please enter valid order status. e.g:- "Shipped" or "Delivered"'
      )
    )
  }

  const order = await Order.findById(orderID)

  if (!order) {
    return next(createCustomError(status.NOT_FOUND, 'Order not found'))
  }

  if (order.orderStatus === 'Delivered') {
    return next(
      createCustomError(status.BAD_REQUEST, 'Order is already delivered')
    )
  }

  if (orderStatus === 'Shipped') {
    order.orderItems.forEach(async (item) => {
      await updateStock(item.product, item.quantity)
    })
  }

  order.orderStatus = orderStatus

  if (orderStatus === 'Delivered') {
    order.deliveredAt = Date.now()
  }

  await order.save({ validateBeforeSave: false })

  res.status(status.OK).json({ success: true, order })
})

// Delete a order
const deleteOrder = asyncWrapper(async (req, res, next) => {
  const { id: orderID } = req.params

  const order = await Order.findById(orderID)

  if (!order) {
    return next(createCustomError(status.NOT_FOUND, 'Order not found'))
  }

  await Order.findByIdAndDelete(orderID)

  res.status(status.OK).json({
    success: true,
    message: `Order of id ${order._id} is deleted successfully`,
  })
})

module.exports = {
  createNewOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
}
