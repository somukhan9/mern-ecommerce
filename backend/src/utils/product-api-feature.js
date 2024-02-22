class ProductAPIFeature {
  constructor(query, queryStr) {
    this.query = query
    this.queryStr = queryStr
  }

  search() {
    const search = this.queryStr.search
      ? {
          name: {
            $regex: this.queryStr.search,
            $options: 'i',
          },
        }
      : {}

    this.query = this.query.find({ ...search })

    return this
  }

  filter() {
    let queryStrCopy = { ...this.queryStr }
    const fieldsToBeRemoved = ['search', 'page', 'limit']

    // Filter by Category
    fieldsToBeRemoved.forEach((key) => delete queryStrCopy[key])

    // Filter by Price
    queryStrCopy = JSON.stringify(queryStrCopy)
    queryStrCopy = queryStrCopy.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (key) => `$${key}`
    )

    queryStrCopy = JSON.parse(queryStrCopy)

    this.query = this.query.find({ ...queryStrCopy })

    return this
  }

  pagination() {
    const page = this.queryStr.page || 1
    const limit = this.queryStr.limit || 5
    const skip = limit * (page - 1)
    this.query = this.query.limit(limit).skip(skip)

    return this
  }
}

module.exports = ProductAPIFeature
