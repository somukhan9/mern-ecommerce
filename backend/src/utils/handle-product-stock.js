const Product = require('../models/Product')

// Check for product stock when a product ordered
const checkStock = async (orderItems) => {
  let checkStockObj = { isStockAvailable: true, product: null, quantity: 0 }

  for (let i = 0; i < orderItems.length; i++) {
    item = orderItems[i]

    const product = await Product.findById(item.product)

    if (product.stock < item.quantity) {
      checkStockObj = {
        ...checkStockObj,
        isStockAvailable: false,
        product,
        quantity: item.quantity,
      }
      break
    }
  }

  return checkStockObj
}

// Update product stock when product is delivered
const updateStock = async (productID, quantity) => {
  const product = await Product.findById(productID)

  if (product.stock >= quantity) {
    product.stock -= quantity
  }

  await product.save({ validateBeforeSave: false })
}

module.exports = { checkStock, updateStock }
