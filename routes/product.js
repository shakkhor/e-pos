var express = require('express')
var router = express.Router()
var Parse = require('parse/node')

router.get('/add_product', function (req, res) {
  res.render('product/add_product')
})

router.get('/view_products', async function (req, res) {
  var page = req.query.page || 0
  console.log('\n\n==> page: ' + page)
  var pages, cnt, extraPages, numPageLinks, lastPage
  var currentPage = page

  const displayLimit = 50

  const Product = Parse.Object.extend('Product')
  const query = new Parse.Query(Product)

  const query1 = new Parse.Query(Product)
  objectCount = await query1.count()
  pages = Math.ceil(objectCount / displayLimit)
  query.limit(displayLimit)
  query.skip(page * displayLimit)
  query
    .find()
    .then(result => {
      console.log(result)
      res.render('product/view_products', {
        products: result,
        pages: pages,
        currentPage: currentPage,
        lastPage: pages
      })
    })
    .catch(err => {
      res.render('product/view_products', { error: err })
    })
})

router.post('/insertInDb', function (req, res, next) {
  let name = req.body.product_name
  if (name) {
    const Product = Parse.Object.extend('Product')
    const product = new Product()
    var nameFlat = name.replace(/[^a-zA-Z0-9]/g, '')
    nameFlat = nameFlat.toString().toLowerCase()

    product.set('name', name)
    product.set('nameFlat', nameFlat)
    product
      .save()
      .then(result => {
        res.redirect('view_products')
      })
      .catch(err => {
        // render error view here
      })
  }
})

module.exports = router
