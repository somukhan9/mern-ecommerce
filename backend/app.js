const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const productRoute = require('./src/routes/product-route')
const userRoute = require('./src/routes/user-route')
const orderRoute = require('./src/routes/order-route')

const errorHandlerMiddleware = require('./src/middlewares/error-handler')
const notFound = require('./src/middlewares/not-found')

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))

// product route
app.use('/api/v1', productRoute)
app.use('/api/v1/auth', userRoute)
app.use('/api/v1', orderRoute)

// error not found middleware
app.use(notFound)

// applying error handling middleware
app.use(errorHandlerMiddleware)

module.exports = app
