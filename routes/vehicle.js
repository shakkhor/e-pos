var express = require('express')
var router = express.Router()
var Parse = require('parse/node')

router.get('/add_vehicle', function (req, res) {
  const Customer = Parse.Object.extend('Customer')
  const query = new Parse.Query(Customer)
  // query.skip(600)
  query
    .find()
    .then(result => {
      console.log(result)
      res.render('vehicle/add_vehicle', { customers: result })
    })
    .catch(err => {
      res.render('vehicle/view_vehicle', { error: err })
    })
})

router.get('/modifyVehicle', function (req, res) {
  const Product = Parse.Object.extend('Customer')
  const query = new Parse.Query(Product)
  // query.skip(600)
  query
    .find()
    .then(result => {
      console.log(result)
      res.render('vehicle/modifyVehicle', { customers: result })
    })
    .catch(err => {
      res.render('vehicle/modifyVehicle', { error: err })
    })
})


router.get('/view_vehicle', async function (req, res) {


  var page = req.query.page || 0
  console.log('\n\n==> page: ' + page)
  var pages, cnt, extraPages, numPageLinks, lastPage
  var currentPage = page

  const displayLimit = 50



  const Vehicle = Parse.Object.extend('Vehicle')
  const query = new Parse.Query(Vehicle)
  query.include("customer")
  const query1 = new Parse.Query(Vehicle)
  objectCount = await query1.count()
  pages = Math.ceil(objectCount / displayLimit)

  query.limit(displayLimit)
  query.skip(page * displayLimit)
  // query.skip(600)
  query
    .find()
    .then(result => {
      console.log(result[0].get('driver'))
      console.log(result)
      console.log(result[0].get('customer'))
      res.render('vehicle/newView', {
        products: result, 
        pages: pages,
        currentPage: currentPage,
        lastPage: pages
      })
    })
    .catch(err => {
      res.render('vehicle/newView', { error: err })
    })
})


router.post('/insertInDb', function (req, res, next) {
  const customerId = req.body.company_name
  const registration = req.body.registration
  const vehicle_type = req.body.vehicle_type
  const color = req.body.color
  const driver = req.body.driver
  const driver_no = req.body.driver_no
  console.log('customer = ' + customerId)
  const Customer = Parse.Object.extend('Customer')
  const Vehicle = Parse.Object.extend('Vehicle')
  const query = new Parse.Query(Customer)
  var registrationFlat = registration.replace(/[^a-zA-Z0-9]/g, '')
  registrationFlat = registrationFlat.toString().toLowerCase()
  var driverNoFlat = driver_no.replace(/[^a-zA-Z0-9]/g, '')
  driverNoFlat = driverNoFlat.toString().toLowerCase()
  console.log('###########regFlat########## ' + driverNoFlat)

  query
    .get(customerId)
    .then(customer => {
      console.log('==> customer data: ' + customer)
      const vehicle = new Vehicle()
      vehicle.set('customer', customer)
      vehicle.set('registration', registration)
      vehicle.set('vehicle_type', vehicle_type)
      vehicle.set('color', color)
      vehicle.set('driver', driver)
      vehicle.set('driver_no', driver_no)
      vehicle.set('registrationFlat', registrationFlat)
      vehicle.set('driverNoFlat', driverNoFlat)

      console.log('then ==> customer data: ' + customer)
      vehicle
        .save()
        .then(result => {
          res.redirect('/vehicle/view_vehicle')
        })
        .catch(err => {
          // render error view here
          console.log('error bal' + err)
        })
    })
    .catch(err => {
      console.log(err)
    })
})

router.post('/updateVehicle', async function (req, res, next) {
  const companyId = req.body.companyId
  const vehicleId = req.body.vehicleId
  const color = req.body.color
  const driver = req.body.driver
  const driver_no = req.body.driver_no
  var driverNoFlat = driver_no.replace(/[^a-zA-Z0-9]/g, '')
  driverNoFlat = driverNoFlat.toString().toLowerCase()
  const Customer = Parse.Object.extend('Customer')
  const Vehicle = Parse.Object.extend('Vehicle')
  const query1 = new Parse.Query(Customer)

  var customer = await query1.equalTo('objectId', companyId).first()
  console.log(customer.get('name'))

  console.log(companyId)
  console.log(vehicleId)

  const query = new Parse.Query(Vehicle)

  query
    .get(vehicleId)
    .then(result => {
      result.set('driver', driver)
      result.set('driver_no', driver_no)
      result.set('driverNoFlat', driverNoFlat)
      result
        .save()
        .then(result => {
          res.redirect('/vehicle/view_vehicle')
        })
        .catch(err => {
          console.log(err)
        })
    })
    .catch(err => {
      console.log(err)
    })
})

module.exports = router
