var express = require('express')
var router = express.Router()
var Parse = require('parse/node')

router.get('/currentSummery', function (req, res) {
  const Stock = Parse.Object.extend('Stock')
  const query = new Parse.Query(Stock)
  query.include('product')
  query.greaterThan('quantity', 0)
  query
    .find()
    .then(result => {
      console.log(result)
      res.render('report/currentSummery', { products: result })
    })
    .catch(err => {
      res.render('report/currentSummery', { error: err })
    })
})

router.get('/dueTracsaction', async function (req, res) {
  var page = req.query.page || 0
  console.log('\n\n==> page: ' + page)
  var pages
  var currentPage = page

  const displayLimit = 50

  const Bill = Parse.Object.extend('DueTransaction')
  const query = new Parse.Query(Bill)
  const query1 = new Parse.Query(Bill)
  objectCount = await query1.count()
  pages = Math.ceil(objectCount / displayLimit)
  query.limit(displayLimit)
  query.skip(page * displayLimit)

  query.descending('createdAt')
  query.include('customer')

  query
    .find()
    .then(result => {
      // console.log(JSON.parse(JSON.stringify(result)))
      res.render('report/dueTracsaction', {
        bills: result,
        pages: pages,
        currentPage: currentPage,
        lastPage: pages
      })
    })
    .catch(err => {
      console.log(err)
    })
})
router.get('/accTransaction', async function (req, res) {
  var page = req.query.page || 0
  console.log('\n\n==> page: ' + page)
  var pages
  var currentPage = page

  const displayLimit = 50

  const Bill = Parse.Object.extend('AccountTransaction')
  const query = new Parse.Query(Bill)
  const query1 = new Parse.Query(Bill)
  objectCount = await query1.count()
  pages = Math.ceil(objectCount / displayLimit)
  query.limit(displayLimit)
  query.skip(page * displayLimit)

  query.descending('createdAt')

  query
    .find()
    .then(result => {
      // console.log(JSON.stringify(result))
      res.render('report/accTransaction', {
        bills: result,
        pages: pages,
        currentPage: currentPage,
        lastPage: pages
      })
    })
    .catch(err => {
      console.log(err)
    })
})

router.get('/salesBetweenTime', async function (req, res) {
  var page = req.query.page || 0
  console.log('\n\n==> page: ' + page)
  var pages
  var currentPage = page

  const displayLimit = 50

  const Bill = Parse.Object.extend('BillTransaction')
  const query = new Parse.Query(Bill)
  const query1 = new Parse.Query(Bill)
  objectCount = await query1.count()
  pages = Math.ceil(objectCount / displayLimit)
  query.limit(displayLimit)
  query.skip(page * displayLimit)

  query.descending('createdAt')

  query
    .find()
    .then(result => {
      // console.log(JSON.stringify(result))
      res.render('report/salesBetweenTime', {
        bills: result,
        pages: pages,
        currentPage: currentPage,
        lastPage: pages
      })
    })
    .catch(err => {
      console.log(err)
    })

  // const Product = Parse.Object.extend('Product')
  // const query = new Parse.Query(Product)
  // query
  //   .find()
  //   .then(result => {
  //     console.log(result)
  //     res.render('report/salesBetweenTime', { products: result })
  //   })
  //   .catch(err => {
  //     res.render('report/salesBetweenTime', { error: err })
  //   })
  var pipelineObject = {
    group: { objectId: '$item', total: { $sum: '$quantity' } }
  };

  var query22 = new Parse.Query("BillTransaction");

  query22.aggregate(pipelineObject)
    .then(function (results) {
      // results contains unique score values
      console.log(results)
    })
    .catch(function (error) {
      // There was an error.
    });




})

router.get('/salesToCustomer', function (req, res) {
  const Bill = Parse.Object.extend('Bill')
  const query = new Parse.Query(Bill)
  query.descending('createdAt')

  query
    .find()
    .then(result => {
      res.render('report/salesToCustomer', { bills: result })
    })
    .catch(err => {
      console.log(err)
    })
})

router.get('/salesToVehicle', function (req, res) {
  const Bill = Parse.Object.extend('Bill')
  const query = new Parse.Query(Bill)
  query.descending('createdAt')

  query
    .find()
    .then(result => {
      res.render('report/salesToVehicle', { bills: result })
    })
    .catch(err => {
      console.log(err)
    })
})

module.exports = router
