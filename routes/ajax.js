var express = require('express')
var router = express.Router()
var Parse = require('parse/node')

router.get('/get-vehicle', async function (req, res) {
  var reg = req.query.id
  reg = reg.replace(/[^a-zA-Z0-9]/g, '')
  reg = reg.toString().toLowerCase()
  const Vehicle = Parse.Object.extend('Vehicle')
  const query1 = new Parse.Query(Vehicle)
  const query2 = new Parse.Query(Vehicle)
  const query3 = new Parse.Query(Vehicle)
  const query4 = new Parse.Query(Vehicle)
 
  query1.startsWith('registrationFlat', reg)
  query2.startsWith('driverNoFlat', reg)
  query3.endsWith('registrationFlat', reg)
  query4.endsWith('driverNoFlat', reg)

  var query5 = Parse.Query.or(query1, query2)
  var query6 = Parse.Query.or(query3, query4)
  var query = Parse.Query.or(query5, query6)

  var data = []
  // query.fullText('registrationFlat', reg)
  // query.select('registration')
  var result = await query
    .find()
    .then(result => {
      console.log('i#####  ##########data#########: ' + typeof result)
      console.log(result)
      result.forEach(el => {
        data.push({
          id: el.get('registration'),
          title: el.get('registration') + el.get('driverNoFlat'),
          text: el.get('registration') + ',' + el.get('driverNoFlat')
        })
      })
      res.send(data)
    })
    .catch(err => {
      console.log(err)
      res.send([err])
    })

  // var obj = {}

  // obj.id = 'Select Vehicle'
  // obj.title = 'Select Vehicle'
  // obj.text = '<div> Select Vehicle </div>'
  // data.push(obj)

  // res.send(data)
})

router.get('/check-registration', async function (req, res) {
  var reg = req.query.id
  reg = reg.replace(/[^a-zA-Z0-9]/g, '')
  reg = reg.toString().toLowerCase()
  const Vehicle = Parse.Object.extend('Vehicle')
  const query = new Parse.Query(Vehicle)
  var check = []
  query.equalTo('registrationFlat', reg)
  console.log('==> registration name: ' + reg)
  query
    .find()
    .then(result => {
      if (result.length > 0) {
        res.send(true)
        console.log(result[0].registrationFlat)
      } else {
        console.log('false')
        res.send(false)
      }
    })
    .catch(err => {
      console.log(err)
    })
})
router.get('/get-company1', async function (req, res) {
  var regId = req.query.id
  const Vehicle = Parse.Object.extend('Vehicle')
  const query = new Parse.Query(Vehicle)
  query.include('customer')
  result = await query.equalTo('registration', regId).first()
  res.send(result)
})

router.get('/get-company', async function (req, res) {
  console.log('get-company')
  console.log(req.query.id)
  var regId = req.query.id
  const Vehicle = Parse.Object.extend('Vehicle')
  const query = new Parse.Query(Vehicle)
  const Discount = Parse.Object.extend('Discount')
  const discountQuery = new Parse.Query(Discount)
  query.include('customer')
  vehicle = await query.equalTo('registration', regId).first()
  // .then(result => {
  //     res.send(result)
  // })
  // .catch(err => {
  //     res.send({});
  // });
  discountQuery.include('company')
  discountQuery.include('product')
  console.log(vehicle.get('customer'))
  discountQuery.equalTo('company', vehicle.get('customer'))

  var discounts = await discountQuery.find()

  var newDiscounts = JSON.parse(JSON.stringify(discounts))
  console.log(' worked     ' + typeof discounts)
  var result = {}
  result['discounts'] = discounts
  result['company'] = vehicle.get('customer')
  // console.log(' worked###     ' + discounts[0].get('company').get('name'))
  res.send(result)

  // Parse.User.logOut()
  //     .then(result => {
  //         console.log(result);
  //         res.redirect("/");
  //     })
  //     .catch(err => {
  //         console.log(err);
  //         res.redirect("/");
  //     });
})

router.get('/update-bills', function (req, res) {
  console.log('Update bills: ' + obj)
  var obj = req.query.obj
  res.send('obj: ' + obj)
})

router.get('/modify-vehicle', async function (req, res) {
  var reg = req.query.id
  reg = reg.replace(/[^a-zA-Z0-9]/g, '')
  reg = reg.toString().toLowerCase()
  const Vehicle = Parse.Object.extend('Vehicle')
  const query1 = new Parse.Query(Vehicle)
  const query2 = new Parse.Query(Vehicle)
  query1.startsWith('registrationFlat', reg)
  query2.startsWith('driverNoFlat', reg)

  var query = Parse.Query.or(query1, query2)
  query.include('company')

  var data = []
  // query.fullText('registrationFlat', reg)
  // query.select('registration')
  var result = await query
    .find()
    .then(result => {
      console.log('i#####  ##########data#########: ' + typeof result)
      console.log(result)
      result.forEach(el => {
        data.push({
          id: el.get('registration'),
          title: el.get('registration') + el.get('driverNoFlat'),
          text: el.get('registration') + ',' + el.get('driverNoFlat')
        })
      })
      res.send(data)
    })
    .catch(err => {
      console.log(err)
      res.send([err])
    })

  // var obj = {}

  // obj.id = 'Select Vehicle'
  // obj.title = 'Select Vehicle'
  // obj.text = '<div> Select Vehicle </div>'
  // data.push(obj)

  // res.send(data)
})
router.get('/get-balance', async function (req, res) {
  var customerId = req.query.id
  console.log('get balance called')
  const Customer = Parse.Object.extend('Customer')
  var customerQuery = new Parse.Query(Customer)
  customerQuery.equalTo('objectId', customerId)
  const CA = Parse.Object.extend('CustomerAccount')
  const query = new Parse.Query(CA)
  query.matchesQuery('customer', customerQuery)
  query
    .find()
    .then(result => {
      console.log(result)
      res.send(result)
      console.log(result)
      res.send(result)
    })
    .catch(err => {
      console.log(err)
    })
})

router.get('/check-product', async function (req, res) {
  var product = req.query.id
  product = product.replace(/[^a-zA-Z0-9]/g, '')
  product = product.toString().toLowerCase()
  const Product = Parse.Object.extend('Product')
  const query = new Parse.Query(Product)
  var check = []
  query.equalTo('nameFlat', product)
  console.log('==> registration name: ' + product)
  query
    .find()
    .then(result => {
      if (result.length > 0) {
        res.send(true)
        console.log(result[0].registrationFlat)
      } else {
        console.log('false')
        res.send(false)
      }
    })
    .catch(err => {
      console.log(err)
    })
})

module.exports = router
