const mongoose = require('mongoose')

const connectDB = () => {
  const databaseConnectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }

  mongoose.connect(process.env.DATABASE_URI, databaseConnectionParams)

  mongoose.connection.on('connected', () => {
    console.log('Database connection successfull.')
  })

  // mongoose.connection.on('error', (err) => {
  //   console.log(`Error while connecting to database: ${err}`)
  // })

  mongoose.connection.on('disconnected', () => {
    console.log('Mongodb connection disconnected')
  })
}

module.exports = connectDB
