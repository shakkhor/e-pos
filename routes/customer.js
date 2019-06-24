var express = require('express')
var router = express.Router()
var Parse = require('parse/node')

router.get('/add_customer', async function (req, res) {
  res.render('customer/add_customer')
})

router.get('/view_customers', async function (req, res) {
  var page = req.query.page || 0
  console.log('\n\n==> page: ' + page)
  var pages, cnt, extraPages, numPageLinks, lastPage
  var currentPage = page

  const displayLimit = 50

  const Customer = Parse.Object.extend('Customer')
  const query = new Parse.Query(Customer)
  const query1 = new Parse.Query(Customer)

  objectCount = await query1.count()
  pages = Math.ceil(objectCount / displayLimit)
  console.log(objectCount)

  console.log(page)
  console.log(page)

  query.descending('updatedAt')
  query.limit(displayLimit)
  query.skip(page * displayLimit)
  query
    .find()
    .then(result => {
      // console.log(result)

      res.render('customer/view_customers', {
        products: result,
        pages: pages,
        currentPage: currentPage,
        lastPage: pages
      })
    })
    .catch(err => {
      res.render('customer/view_customers', { error: err })
    })
})

router.post('/insertInDb', function (req, res, next) {
  var name = req.body.company_name
  var address = req.body.address
  var email = req.body.email
  var contact_person = req.body.contact_person
  var contact_no = req.body.contact_no
  // var discount_radio = req.body.discount_radio;
  // var discount = req.body.discount

  // console.log("discount_radio: " + discount_radio)

  // if (discount_radio === "parcent") {
  //     discount = parseFloat(discount);
  //     discount = discount / 100.0;
  //     discount = discount.toString();
  //     console.log("discount: " + discount_radio)
  // }
  const CA = Parse.Object.extend('CustomerAccount')
  var newCA = new CA()

  if (name) {
    const Customer = Parse.Object.extend('Customer')
    const customer = new Customer()
    customer.set('name', name)
    customer.set('address', address)
    customer.set('email', email)
    customer.set('contact_person', contact_person)
    customer.set('contact_no', contact_no)
    // product.set('discount', discount)
    customer
      .save()
      .then(result => {
        console.log('new customer>>>>>>>>>>>' + result.id)
        /// /setting up customer account/////////////
        newCA.set('customer', result)
        newCA.set('balance', 0)
        newCA.set('due', 0)
        newCA
          .save()
          .then(res => {
            console.log('account Saved')
          })
          .catch(err => {
            console.log(err)
          })
        res.redirect('view_customers')
      })
      .catch(err => {
        console.log(err)
      })
  }
})

router.get('/customerAccounts', async function (req, res) {
  var page = req.query.page || 0
  console.log('\n\n==> page: ' + page)
  var pages, cnt, extraPages, numPageLinks, lastPage
  var currentPage = page

  const displayLimit = 50

  const Customer = Parse.Object.extend('CustomerAccount')
  const query = new Parse.Query(Customer)
  const query1 = new Parse.Query(Customer)

  objectCount = await query1.count()
  pages = Math.ceil(objectCount / displayLimit)
  console.log(objectCount)

  console.log(page)
  console.log(page)
  query.include('customer')
  query.descending('updatedAt')
  query.limit(displayLimit)
  query.skip(page * displayLimit)
  query
    .find()
    .then(result => {
      console.log(JSON.stringify(result))

      res.render('customer/customerAccounts', {
        products: result,
        pages: pages,
        currentPage: currentPage,
        lastPage: pages
      })
    })
    .catch(err => {
      res.render('customer/customerAccounts', { error: err })
    })
})

module.exports = router
