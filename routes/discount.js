var express = require('express')
var router = express.Router()
var Parse = require('parse/node')

router.get('/setDiscount', async function (req, res) {
  const Customer = Parse.Object.extend('Customer')
  const query1 = new Parse.Query(Customer)
  var company = await query1.find()

  const Product = Parse.Object.extend('Product')
  const query = new Parse.Query(Product)
  query.ascending('objectId')
  // var products = await query.find()

  Parse.User.enableUnsafeCurrentUser()
  Parse.User.currentAsync().then(function (user) {
    // do stuff with your user

    if (user) {
      console.log(
        'user found >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>        ' +
          user.get('role')
      )

      console.log('user found ' + user.id)
      if (user.get('role') == 'admin') {
        query
          .find()
          .then(result => {
            console.log(result)
            res.render('discount/setDiscount', {
              products: result,
              customers: company
            })
          })
          .catch(err => {
            res.render('discount/setDiscount', { error: err })
          })
      } else {
        res.render('opps/oppsPage')
      }
    }
  })
  // res.render('discount/setDiscount', { products: result, customers: company })
})

router.post('/settDiscount', async function (req, res, next) {
  var request = JSON.stringify(req.body)
  var req2 = JSON.parse(request)
  var proudctName = req2.proudctName
  var productId = req2.pid
  var taka = req2.taka
  var percent = req2.percent
  var company = req2.company_name

  const Customer = Parse.Object.extend('Customer')
  const Product = Parse.Object.extend('Product')
  const Discount = Parse.Object.extend('Discount')

  var customerQuery = new Parse.Query(Customer)
  customerQuery.equalTo('objectId', company)

  const query = new Parse.Query(Discount)
  query.matchesQuery('company', customerQuery)
  pQuery = new Parse.Query(Product)
  // pQuery.get(productId)
  var product = await pQuery.get(productId)
  cQuery = new Parse.Query(Customer)
  cQuery.get(company)
  var cust = await cQuery.get(company)
  console.log(' hello')
  console.log(product)
  await query
    .find()
    .then(result => {
      console.log(result.length)
      console.log(productId)
      console.log(product)

      var i = 0
      for (i; i < result.length; i++) {
        if (result[i].get('product').id == productId) {
          result[i].set('discountTaka', taka)
          result[i].set('discountPercent', percent)
          result[i]
            .save()
            .then(disc => {
              console.log('Updated discount')
            })
            .catch(err => {
              console.log(err)
            })
          break
        }
      }
      if (i == result.length) {
        const discount = new Discount()
        discount.set('company', cust)
        discount.set('product', product)
        discount.set('discountTaka', taka)
        discount.set('discountPercent', percent)
        discount
          .save()
          .then(disc => {
            console.log('Saved new discount')
          })
          .catch(err => {
            console.log(err)
          })
      }
    })
    .catch(err => {
      console.log(err)
    })

  res.redirect('/discount/setDiscount')
})

router.get('/viewDiscount', async function (req, res) {
  console.log('Before Query %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
  var page = req.query.page || 0
  console.log('\n\n==> page: ' + page)
  var pages, cnt, extraPages, numPageLinks, lastPage
  var currentPage = page

  const displayLimit = 50

  const Discount = Parse.Object.extend('Discount')
  const query1 = new Parse.Query(Discount)
  objectCount = await query1.count()
  pages = Math.ceil(objectCount / displayLimit)

  const query = new Parse.Query(Discount)
  query.include('company')
  query.include('product')

  query.limit(displayLimit)
  query.skip(page * displayLimit)
  query
    .find()
    .then(result => {
      console.log(result)
      var newD = JSON.parse(JSON.stringify(result))
      console.log(newD)
      res.render('discount/viewDiscount', {
        discounts: result,
        pages: pages,
        currentPage: currentPage,
        lastPage: pages
      })
    })
    .catch(err => {
      console.log(err)
    })
})

module.exports = router
