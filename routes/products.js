var express = require('express')
var router = express.Router()
var Parse = require('parse/node')
// Homepage
router.get('/', function (req, res) {
  const Product = Parse.Object.extend('Product')
  const query = new Parse.Query(Product)
  query
    .find()
    .then(result => {
      console.log(result)
      res.render('product/product', { products: result })
    })
    .catch(err => {
      res.render('product/product', { error: err })
    })
})

router.get('/create', function (req, res) {
  res.render('product/addProduct')
})

router.post('/insertInDb', function (req, res, next) {
  let name = req.body.name
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
        res.redirect('/product')
      })
      .catch(err => {
        // render error view here
      })
  }
})
module.exports = router
