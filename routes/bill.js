var express = require('express')
var router = express.Router()
var Parse = require('parse/node')
var path = require('path')

const ThermalPrinter = require('node-thermal-printer').printer
const PrinterTypes = require('node-thermal-printer').types

const escpos = require('escpos')

router.get('/dueReceive', async function (req, res) {
  const Customer = Parse.Object.extend('Customer')
  var query = new Parse.Query(Customer)
  query
    .find()
    .then(result => {
      res.render('bill/dueReceive', { customers: result })
    })
    .catch(err => {
      console.log(err)
    })
})

router.post('/due', async function (req, res) {
  var customerId = req.body.company_name.split(',')[0]
  var name = req.body.company_name.split(',')[1]
  balance = Number(req.body.balanceNow)
  dueReceive = Number(req.body.dueReceive)
  balance += dueReceive
  console.log(customerId)
  console.log('get balance called')
  const Customer = Parse.Object.extend('Customer')

  var customerQuery = new Parse.Query(Customer)
  customerQuery.equalTo('objectId', customerId)
  const CA = Parse.Object.extend('CustomerAccount')
  const query = new Parse.Query(CA)
  const query1 = new Parse.Query(CA)
  query.matchesQuery('customer', customerQuery)
  account = await query.find()
  account = JSON.parse(JSON.stringify(account))
  console.log(account[0].objectId)

  caId = account[0].objectId
  query1
    .get(caId)
    .then(result => {
      var today = new Date()
      var dd = String(today.getDate()).padStart(2, '0')
      var mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
      var yyyy = today.getFullYear()

      today = dd + '/' + mm + '/' + yyyy
      var id = +new Date()


      var due = {}
      due['company'] = name
      due['oldBalance'] = Number(req.body.balanceNow)
      due['received'] = Number(req.body.dueReceive)
      due['currentBalance'] = Number(balance)
      due['date'] = today
      due['id'] = id

      const DueTransaction = Parse.Object.extend('DueTransaction')
      const dueT = new DueTransaction()
      dueT.set('date', today)
      console.log(result)
      dueT.set('id', id)
      dueT.set('customer', result)
      dueT.set('customerName', name)
      dueT.set('oldBalance', account[0].balance)
      dueT.set('dueReceive', dueReceive)
      dueT.set('newBalance', balance)
      dueT
        .save()
        .then(result => {
          console.log('Success')
          res.render('bill/duePrint', { due: due })
        })
        .catch(err => {
          console.log(err)
        })

      result
        .set('balance', balance)
        .save()
        .then(res => {
          console.log('saved')
        })
        .catch(err => {
          console.log(err)
        })
    })
    .catch(err => {
      console.log(err)
    })

  // var today = new Date()
  // var dd = String(today.getDate()).padStart(2, '0')
  // var mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
  // var yyyy = today.getFullYear()

  // today = dd + '/' + mm + '/' + yyyy

  // const DueTransaction = Parse.Object.extend('DueTransaction')
  // const dueT = new DueTransaction()
  // dueT.set('date', today)
  // dueT.set('oldBalance', account[0].balance)
  // dueT.set('dueReceive', dueReceive)
  // dueT.set('newBalance', balance)
  // dueT
  //   .save()
  //   .then(result => {
  //     console.log('Success')
  //     res.redirect('/bill/dueReceive')
  //   })
  //   .catch(err => {
  //     console.log(err)
  //   })
})
router.post('/duePrint', function (req, res) {
  console.log(req.body)

  ob = req.body.oldBalance
  cb = req.body.currentBalance
  dr = req.body.dueReceive
  ob = ob.padStart(14, ' ')
  cb = cb.padStart(10, ' ')
  dr = dr.padStart(11, ' ')

  const escpos = require('escpos')
  // console.log('hello device ' + device)
  // Select the adapter based on your printer type
  var device
  try {
    device = new escpos.USB()
  } catch (err) {
    console.log(err)

    res.render('opps/noPrinter')
  }
  // const device = new escpos.USB()
  // const device  = new escpos.Network('localhost');
  // const device  = new escpos.Serial('/dev/usb/lp0');

  const options = { encoding: 'GB18030' /* default */ }
  // encoding is optional

  const printer = new escpos.Printer(device, options)

  device.open(function () {
    console.log('hello printer ' + printer)
    printer
      .font('a')
      .align('ct')
      .style('bu')
      .size(2, 1)
      .text('CASH/CREDIT MEMO')
      .text('M/S DOFADER FILLING')
      .text('STATION')
      .size(1, 1)
      .text('01872 744645')
      .text('Address: Patuakandi, Veramara, Kustia')
      .text('')
      .align('lt')
      .text('Receipt No# ' + req.body.id + '    DATE: ' + req.body.date)
      .text('')
      .text('Company: ' + req.body.company)
      .text('')
      .text('-----------------------------------------------')
    printer.align('rt')
    printer
      .text('Old Balance: ' + ob)
      .text('---------------------')
      .text('Due Received: ' + dr)
      .text('---------------------')
      .text('Current Balance: ' + cb)
      .text('---------------------')
    printer
      .align('ct')
      .text('')
      .text('')
      .text('Open 24/7')
      .text('Thank You For Coming To Us.')
      .text('')
      .text('')
    printer.cut()
    printer.close()
  })

  res.redirect('/bill/dueReceive')
})


router.get('/newBill', async function (req, res, next) {
  const User = Parse.Object.extend('User')
  const userQuery = new Parse.Query(User)
  userQuery.equalTo('role', 'sales')
  var salesUsers = await userQuery.find()
  const Stock = Parse.Object.extend('Stock')
  const query1 = new Parse.Query(Stock)
  query1.greaterThan('quantity', 0)
  query1.include('product')

  var fuel = await query1.find()
  res.render('bill/newBill', { fuels: fuel, salesMan: salesUsers })
})

/// ///////////////////////////##############  BIll POST ############/////////////////////////////////////////////
/// ///////////////////////////##############  BIll POST ############/////////////////////////////////////////////
/// ///////////////////////////##############  BIll POST ############/////////////////////////////////////////////

router.post('/newBill', async function (req, res, next) {
  var request = JSON.stringify(req.body)
  var req2 = JSON.parse(request)
  var today = new Date()
  var dd = String(today.getDate()).padStart(2, '0')
  var mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
  var yyyy = today.getFullYear()
  today = dd + '/' + mm + '/' + yyyy
  var customerId = req2.companyId
  /// ///customer account
  console.log(customerId)

  const Customer = Parse.Object.extend('Customer')
  var customerQuery = new Parse.Query(Customer)
  customerQuery.equalTo('objectId', customerId)
  const CA = Parse.Object.extend('CustomerAccount')
  const query = new Parse.Query(CA)
  const query1 = new Parse.Query(CA)
  query.matchesQuery('customer', customerQuery)
  // query
  //   .find()
  //   .then(account => {
  //     var balance = Number(account.get(balance)) - Number(req2.dueTaka)
  //     account.set('balance', balance)
  //     account
  //       .save()
  //       .then(res => {
  //         console.log('balance saved')
  //       })
  //       .catch(err => {
  //         console.log(err)
  //       })
  //   })
  //   .catch(err => {
  //     console.log(err)
  //   })
  account = await query.find()
  account = JSON.parse(JSON.stringify(account))
  console.log(account[0].objectId)
  caId = account[0].objectId
  query1
    .get(caId)
    .then(result => {
      var balance = Number(result.get('balance')) - Number(req2.dueTaka)
      result
        .set('balance', balance)
        .save()
        .then(res => {
          console.log('balance saved')
        })
        .catch(err => {
          console.log(err)
        })
    })
    .catch(err => {
      console.log(err)
    })

  // customer //account

  const Pump = Parse.Object.extend('Pump')
  const pumpQuery = new Parse.Query(Pump)
  var pumpAccount = await pumpQuery.first()
  balance = pumpAccount.get('balance')
  profit = parseFloat(req2.totalProfit)
  console.log(profit)
  console.log(balance + profit)
  pumpAccount
    .set('balance', balance + Number(req2.totalPayable))
    .save()
    .then(res => {
      console.log('Account Balance saved')
    })
    .catch(err => {
      console.log(err)
    })
  const AccountTransaction = Parse.Object.extend('AccountTransaction')
  const accountTrans = new AccountTransaction()
  accountTrans.set('date', today)
  accountTrans.set('note', 'bill')
  accountTrans.set('deposit', Number(req2.totalPayable))
  accountTrans.set('withdrawal', 0)
  accountTrans.set('oldBalance', balance)
  accountTrans.set('newBalance', balance + Number(req2.totalPayable))
  accountTrans
    .save()
    .then(res => {
      console.log('accountTrans saved')
    })
    .catch(err => {
      console.log(err)
    })
  // ////######################## stock up date
  // console.log('Number Of          --------------->' + req2.numberOfProduct)

  const Stock = Parse.Object.extend('Stock')
  var billProduct = []
  var products = []
  var quantities = []
  var profits = []
  var purPrice = []
  var salesPrice = []
  var totalPrice = []
  var discounts = []
  if (req2.numberOfProduct == 1) {
    products.push(req2.product)
    quantities.push(req2.quantities)
    profits.push(req2.profit)
    salesPrice.push(req2.sellingPrice)
    purPrice.push(req2.buyingPrice)
    totalPrice.push(req2.subTotals)
    discounts.push(req2.discounts)
    console.log(discounts)
  } else {
    products = req2.product
    quantities = req2.quantities
    profits = req2.profit
    salesPrice = req2.sellingPrice
    purPrice = req2.buyingPrice
    totalPrice = req2.subTotals
    discounts = req2.discounts
    console.log('discounts->>>>>>>>>>>>>>>>>>  ' + discounts)
  }
  const BillTransaction = Parse.Object.extend('BillTransaction')

  for (i = 0; i < products.length; i++) {
    var items = products[i].split(' ')

    var transaction = new BillTransaction()
    transaction.set('date', today)
    transaction.set('customer', req2.company)
    const query1 = new Parse.Query(Stock)
    query1.include('product')
    await query1.get(items[1]).then(stock => {
      console.log(JSON.stringify(stock))
      const currentQuantity = Number(stock.get('quantity'))
      const newQuantity = currentQuantity - Number(quantities[i])
      // console.log(newQuantity)
      stock.set('quantity', newQuantity)
      transaction.set('item', stock.get('product').get('name'))
      billProduct.push(stock.get('product').get('name'))
      stock
        .save()
        .then(result => {
          console.log('Success')
        })
        .catch(err => {
          console.log(err)
        })
    })
    transaction.set('quantity', Number(quantities[i]))
    transaction.set('purchasePrice', Number(purPrice[i]))
    transaction.set('sellingPrice', Number(salesPrice[i]))
    transaction.set('totalPrice', Number(totalPrice[i]))
    transaction.set('discount', Number(discounts[i]))
    transaction.set('profit', Number(profits[i]))
    await transaction
      .save()
      .then(res => {
        console.log('transaction Successful')
      })
      .catch(err => {
        console.log(err)
      })
  }

  const Vehicle = Parse.Object.extend('Vehicle')

  const vehicleQuery = new Parse.Query(Vehicle)
  vehicleQuery.include('companyName')
  vehicleQuery.equalTo('registration', req2.vehicle)
  var vehicle = await vehicleQuery.find()
  var billManName
  await Parse.User.enableUnsafeCurrentUser()
  await Parse.User.currentAsync().then(async function (user) {
    console.log(JSON.stringify(user))
    person = JSON.parse(JSON.stringify(user))
    billManName = person.fullName
    console.log(billManName)
  })



  /// ///////////////////savaing bill //////////////////////////////

  const Bill = Parse.Object.extend('Bill')
  const newBill = new Bill()
  // console.log(+ new Date())
  var id = +new Date()
  newBill.set('billNo', id)
  newBill.set('due', Number(req2.dueTaka))
  newBill.set('company', req2.company)
  newBill.set('vehicle', req2.vehicle)
  newBill.set('date', today)
  newBill.set('items', billProduct)
  newBill.set('qty', quantities)
  newBill.set('price', salesPrice)
  newBill.set('subTotal', totalPrice)
  newBill.set('discounts', discounts)
  newBill.set('totalPrice', Number(req2.totalPayable))
  newBill.set('paid', Number(req2.cash))
  newBill.set('seller', req.body.salesMan)
  newBill.set('billMan', billManName)
  newBill
    .save()
    .then(res => {
      console.log('Bill saved')
    })
    .catch(err => {
      console.log(err)
    })
  /// /////////////////////// Print BIll////////////////////
  var bill = {}
  bill['id'] = id
  bill['company'] = req2.company
  bill['numberOfProduct'] = req2.numberOfProduct
  bill['salesMan'] = req2.salesMan
  bill['vehicle'] = req2.vehicle
  bill['quantities'] = quantities
  bill['dueTaka'] = req2.dueTaka
  bill['cash'] = req2.cash
  bill['totalPrice'] = req2.totalPrice
  bill['subTotals'] = totalPrice
  bill['sellingPrice'] = salesPrice
  bill['products'] = billProduct
  bill['totalPayable'] = req2.totalPayable
  bill['discount'] = req2.totalDiscount
  res.render('bill/newConfirm', { bill: bill })
  console.log(req2.dueTaka)
  console.log(bill)
})

router.post('/newQuickBill', async function (req, res, next) {
  var request = JSON.stringify(req.body)
  var req2 = JSON.parse(request)
  var today = new Date()
  var dd = String(today.getDate()).padStart(2, '0')
  var mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
  var yyyy = today.getFullYear()
  today = dd + '/' + mm + '/' + yyyy
  var customerId = req2.companyId
  // //////customer account
  // console.log(customerId)

  // const Customer = Parse.Object.extend('Customer')
  // var customerQuery = new Parse.Query(Customer)
  // customerQuery.equalTo('objectId', customerId)
  // const CA = Parse.Object.extend('CustomerAccount')
  // const query = new Parse.Query(CA)
  // const query1 = new Parse.Query(CA)
  // query.matchesQuery('customer', customerQuery)
  // account = await query.find()
  // account = JSON.parse(JSON.stringify(account))
  // console.log(account[0].objectId)
  // caId = account[0].objectId
  // query1
  //   .get(caId)
  //   .then(result => {
  //     var balance = Number(result.get('balance')) - Number(req2.dueTaka)
  //     result
  //       .set('balance', balance)
  //       .save()
  //       .then(res => {
  //         console.log('balance saved')
  //       })
  //       .catch(err => {
  //         console.log(err)
  //       })
  //   })
  //   .catch(err => {
  //     console.log(err)
  //   })

  // //customer //account

  const Pump = Parse.Object.extend('Pump')
  const pumpQuery = new Parse.Query(Pump)
  var pumpAccount = await pumpQuery.first()
  balance = pumpAccount.get('balance')
  profit = parseFloat(req2.totalProfit)
  console.log(profit)
  console.log(balance + profit)
  pumpAccount
    .set('balance', balance + Number(req2.totalPrice))
    .save()
    .then(res => {
      console.log('Account Balance saved')
    })
    .catch(err => {
      console.log(err)
    })
  const AccountTransaction = Parse.Object.extend('AccountTransaction')
  const accountTrans = new AccountTransaction()
  accountTrans.set('date', today)
  accountTrans.set('note', 'bill')
  accountTrans.set('deposit', Number(req2.totalPrice))
  accountTrans.set('withdrawal', 0)
  accountTrans.set('oldBalance', balance)
  accountTrans.set('newBalance', balance + Number(req2.totalPrice))
  accountTrans
    .save()
    .then(res => {
      console.log('accountTrans saved')
    })
    .catch(err => {
      console.log(err)
    })
  // ////######################## stock up date
  // console.log('Number Of          --------------->' + req2.numberOfProduct)

  const Stock = Parse.Object.extend('Stock')
  var billProduct = []
  var products = []
  var quantities = []
  var profits = []
  var purPrice = []
  var salesPrice = []
  var totalPrice = []
  var discounts = []
  if (req2.numberOfProduct == 1) {
    products.push(req2.product)
    quantities.push(req2.quantities)
    profits.push(req2.profit)
    salesPrice.push(req2.sellingPrice)
    purPrice.push(req2.buyingPrice)
    totalPrice.push(req2.subTotals)
    discounts.push(req2.discounts)
  } else {
    products = req2.product
    quantities = req2.quantities
    profits = req2.profit
    salesPrice = req2.sellingPrice
    purPrice = req2.buyingPrice
    totalPrice = req2.subTotals
    discounts = req2.discounts
  }
  const BillTransaction = Parse.Object.extend('BillTransaction')

  for (i = 0; i < products.length; i++) {
    var items = products[i].split(' ')

    var transaction = new BillTransaction()
    transaction.set('date', today)
    transaction.set('customer', req2.company)
    const query1 = new Parse.Query(Stock)
    query1.include('product')
    await query1.get(items[1]).then(stock => {
      console.log(JSON.stringify(stock))
      const currentQuantity = Number(stock.get('quantity'))
      const newQuantity = currentQuantity - Number(quantities[i])
      // console.log(newQuantity)
      stock.set('quantity', newQuantity)
      transaction.set('item', stock.get('product').get('name'))
      billProduct.push(stock.get('product').get('name'))
      stock
        .save()
        .then(result => {
          console.log('Success')
        })
        .catch(err => {
          console.log(err)
        })
    })
    transaction.set('quantity', Number(quantities[i]))
    transaction.set('purchasePrice', Number(purPrice[i]))
    transaction.set('sellingPrice', Number(salesPrice[i]))
    transaction.set('totalPrice', Number(totalPrice[i]))
    transaction.set('discount', Number(discounts[i]))
    transaction.set('profit', Number(profits[i]))
    await transaction
      .save()
      .then(res => {
        console.log('transaction Successful')
      })
      .catch(err => {
        console.log(err)
      })
  }

  const Vehicle = Parse.Object.extend('Vehicle')

  const vehicleQuery = new Parse.Query(Vehicle)
  vehicleQuery.include('companyName')
  vehicleQuery.equalTo('registration', req2.vehicle)
  var vehicle = await vehicleQuery.find()

  /// ///////////////////savaing bill //////////////////////////////
  var billManName
  await Parse.User.enableUnsafeCurrentUser()
  await Parse.User.currentAsync().then(async function (user) {
    console.log(JSON.stringify(user))
    person = JSON.parse(JSON.stringify(user))
    billManName = person.fullName
    console.log(billManName)
  })


  console.log(billManName)

  const Bill = Parse.Object.extend('Bill')
  const newBill = new Bill()
  // console.log(+ new Date())
  var id = +new Date()
  newBill.set('billNo', id)
  newBill.set('due', 0)
  newBill.set('company', req2.company)
  newBill.set('vehicle', req2.vehicle)
  newBill.set('date', today)
  newBill.set('items', billProduct)
  newBill.set('qty', quantities)
  newBill.set('price', salesPrice)
  newBill.set('subTotal', totalPrice)
  newBill.set('totalPrice', Number(req2.totalPrice))
  newBill.set('paid', Number(req2.totalPrice))
  newBill.set('seller', req.body.salesMan)
  newBill.set('billMan', billManName)
  console.log('     1231333333333333333333333333   ' + billManName)
  newBill
    .save()
    .then(res => {
      console.log('Bill saved')
    })
    .catch(err => {
      console.log(err)
    })

  /// /////////////////////// Print BIll////////////////////
  var bill = {}
  bill['id'] = id
  bill['company'] = req2.company
  bill['numberOfProduct'] = req2.numberOfProduct
  bill['salesMan'] = req2.salesMan
  bill['vehicle'] = req2.vehicle
  bill['quantities'] = quantities
  bill['dueTaka'] = 0
  bill['cash'] = req2.totalPrice
  bill['totalPrice'] = req2.totalPrice
  bill['totalPayable'] = req2.totalPrice
  bill['discount'] = 0
  bill['subTotals'] = totalPrice
  bill['sellingPrice'] = salesPrice
  bill['products'] = billProduct
  res.render('bill/newConfirm', { bill: bill })
  console.log(req2.dueTaka)
  console.log(bill)
})

router.get('/find_bills', async function (req, res, next) {
  var page = req.query.page || 0
  console.log('\n\n==> page: ' + page)
  var pages, cnt, extraPages, numPageLinks, lastPage
  var currentPage = page

  const displayLimit = 50

  const Bill = Parse.Object.extend('Bill')
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
      res.render('bill/find_bills', {
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

router.get('/quick_bill', async function (req, res, next) {
  const User = Parse.Object.extend('User')
  const userQuery = new Parse.Query(User)
  userQuery.equalTo('role', 'sales')
  var salesUsers = await userQuery.find()
  const Stock = Parse.Object.extend('Stock')
  const query1 = new Parse.Query(Stock)
  query1.greaterThan('quantity', 0)
  query1.include('product')

  var fuel = await query1.find()
  res.render('bill/quick_bill', { fuels: fuel, salesMan: salesUsers })
})

router.get('/print_bill_for_vehicle', function (req, res, next) {
  var vehicle = req.body.vehicle
  var company = req.body.company
  var product = req.body.product
  var sellingPrice = req.body.price
  var quantity = req.body.quantity
  var inStock = req.body.stock
  var afterSaleStcok = req.body.after_stock
  var discount = req.body.discount
  var totalPrice = req.body.totalPrice

  const escpos = require('escpos')
  onsole.log('hello device ' + device)

  // Select the adapter based on your printer type
  const device = new escpos.USB()
  // const device  = new escpos.Network('localhost');
  // const device  = new escpos.Serial('/dev/usb/lp0');

  const options = { encoding: 'GB18030' /* default */ }
  // encoding is optional

  const printer = new escpos.Printer(device, options)
  console.log('hello printer ' + printer)

  device.open(function () {
    console.log('hellow  inside ' + printer)

    printer
      .font('a')
      .align('ct')
      .style('bu')
      .size(2, 1)
      .text('CASH/CREDIT MEMO')
      .text('M/S DOFADER FILLING')
      .text('STATION')
      .size(1, 1)
      .text('01872 7446454 to 8')
      .text('Address: kamal kamal kamal')
      .text('')
      .align('lt')
      .text('BILLNO: 1254789963698441 DATE: 18/05/2019')
      .text('')
      .text('Vehicle no: Dhaka-Metro-Ga-1438287')
      .text('Company: Hanif')
      .text('')
      .text('Item           Qty      UnitPrice      Amount')
      .size(1, 1)
      .text('-----------------------------------------------')
      .text('')
      .text('')

    printer.cut()
    printer.close()
  })
  // // Select the adapter based on your printer type
  // const device = new escpos.USB()
  // // const device  = new escpos.Network('localhost');
  // // const device  = new escpos.Serial('/dev/usb/lp0');

  // const options = { encoding: 'GB18030' /* default */ }
  // // encoding is optional

  // const printer = new escpos.Printer(device, options)
  // console.log(' heloooooooooooooo11111')
  // const tux = path.join('/Users/shakkhor/Desktop', 'tux.png')
  // console.log(' heloooooooooooooo' + tux)
  // var pic

  // device.open(function () {
  //   printer
  //     .font('a')
  //     .align('ct')
  //     .style('bu')
  //     .size(2, 2)
  //     .text('CASH/CREDIT MEMO')
  //     .text('M/S DOFADER FILLING STATION')
  //     .size(1, 1)
  //     .text('01872 7446454 to 8')
  //     .text('Address: kamal kamal kamal')
  // })

  res.redirect('/')
})

router.post('/printBill', function (req, res, next) {
  id = req.body.id
  vehicle = req.body.vehicle
  company = req.body.company
  salesMan = req.body.salesMan
  due = req.body.dueTaka.padStart(12)
  cash = req.body.cash.padStart(12)
  grandTotal = req.body.totalPrice.padStart(12)
  totalDiscount = req.body.totalDiscount.padStart(12)
  totalPayable = req.body.totalPayable.padStart(12)
  if (Number(cash) == 0) {
    cash = '0'
  }
  nOp = req.body.numberOfProduct
  sp = []
  items = []
  qty = []
  sub = []
  if (nOp < 2) {
    sub.push(req.body.subTotals)
    items.push(req.body.product)
    qty.push(req.body.quantities)
    sp.push(req.body.prices)
  } else {
    sub = req.body.subTotals
    items = req.body.product
    qty = req.body.quantities
    sp = req.body.prices
  }
  var printItem = []
  var printPrice = []
  var printUnit = []
  var printTotal = []
  console.log(nOp)
  for (var i = 0; i < nOp; i++) {
    printItem.push(items[i].padEnd(18))
    printPrice.push(sp[i].padEnd(10))
    printUnit.push(qty[i].padEnd(10))
    printTotal.push(sub[i].padStart(10))
    console.log(printItem[i] + printUnit[i] + printPrice[i] + printTotal[i])
  }

  var today = new Date()
  var dd = String(today.getDate()).padStart(2, '0')
  var mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
  var yyyy = today.getFullYear()
  console.log('hello device ' + dd)
  today = dd + '/' + mm + '/' + yyyy

  const escpos = require('escpos')
  // console.log('hello device ' + device)
  // Select the adapter based on your printer type
  var device
  try {
    device = new escpos.USB()
  } catch (err) {
    console.log(err)

    res.render('opps/noPrinter')
  }
  // const device = new escpos.USB()
  // const device  = new escpos.Network('localhost');
  // const device  = new escpos.Serial('/dev/usb/lp0');

  const options = { encoding: 'GB18030' /* default */ }
  // encoding is optional

  const printer = new escpos.Printer(device, options)

  device.open(function () {
    console.log('hello printer ' + printer)
    printer
      .font('a')
      .align('ct')
      .style('bu')
      .size(2, 1)
      .text('CASH/CREDIT MEMO')
      .text('M/S DOFADER FILLING')
      .text('STATION')
      .size(1, 1)
      .text('01872 744645')
      .text('Address: Patuakandi, Veramara, Kustia')
      .text('')
      .align('lt')
      .text('BILLNO# ' + id + '    DATE: ' + today)
      .text('')
      .text('VehicleNo: ' + vehicle)
      .text('Company: ' + company)
      .text('')
      .text('Item              Qty    UnitPrice     SubTotal')
      .text('------------------------------------------------')
    for (var i = 0; i < nOp; i++) {
      printer.text(printItem[i] + printUnit[i] + printPrice[i] + printTotal[i])
    }
    printer.align('rt')
    printer
      .text('---------------------')
      .text('Total: ' + grandTotal)
      .text('---------------------')
      .text('Discount: ' + totalDiscount)
      .text('---------------------')
      .text('Payable: ' + totalPayable)
      .text('---------------------')
      .text('Paid: ' + cash)
      .text('---------------------')
      .text('Due: ' + due)
      .text('---------------------')
    printer
      .align('ct')
      .text('')
      .text('')
      .text('Open 24/7 (' + salesMan + ')')
      .text('Thank You For Coming To Us.')
      .text('')
      .text('')
    printer.cut()
    printer.close()
  })

  res.redirect('/')
})
module.exports = router
