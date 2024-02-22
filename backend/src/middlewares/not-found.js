const status = require('http-status')

const notFound = (req, res) => {
  return res
    .status(status.NOT_FOUND)
    .json({ success: false, message: 'Route does not exist.' })
}

module.exports = notFound
