const dotenv = require('dotenv')
dotenv.config({ path: 'config.env' })

const connectDB = require('./src/config/db')

// Uncaught Exception Handling
process.on('uncaughtException', (err) => {
  console.log(`Error due to Uncaught Exception.\nError: ${err}`)
  process.exit(1)
})

// connecting to the database
connectDB()

const app = require('./app')

const PORT = process.env.PORT || 8000

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

// Unhandled Promise Rejection Handling
process.on('unhandledRejection', (err) => {
  console.log(`Error due to Unhandled Promise Rejection.\nError: ${err}`)
  server.close(() => {
    process.exit(1)
  })
})
