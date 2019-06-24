var express = require('express')
var router = express.Router()
var Parse = require('parse/node')

router.get('/add_stock', function (req, res) {
  const Product = Parse.Object.extend('Product')
  const query = new Parse.Query(Product)

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
            res.render('stock/add_stock', { products: result })
          })
          .catch(err => {
            res.render('stock/view_stock', { error: err })
          })
      } else {
        res.render('opps/oppsPage')
      }
    }
  })
})

router.get('/view_stock', async function (req, res) {
  var page = req.query.page || 0
  console.log('\n\n==> page: ' + page)
  var pages, cnt, extraPages, numPageLinks, lastPage
  var currentPage = page

  const displayLimit = 50

  const Stock = Parse.Object.extend('Stock')
  const query = new Parse.Query(Stock)
  const query1 = new Parse.Query(Stock)
  objectCount = await query1.count()
  pages = Math.ceil(objectCount / displayLimit)

  query.limit(displayLimit)
  query.skip(page * displayLimit)

  query.descending('quantity')
  query.include('product')
  query
    .find()
    .then(result => {
      // console.log(JSON.stringify(result))
      res.render('stock/view_stock', {
        stocks: result,
        pages: pages,
        currentPage: currentPage,
        lastPage: pages
      })
    })
    .catch(err => {
      res.render('stock/view_stock', { error: err })
    })
})

router.post('/insertInDb', async function (req, res, next) {
  console.log(req.body)
  const productId = req.body.pid
  const quantity = Number(req.body.quantity)
  const buyingPrice = Number(req.body.buying_price)
  const sellingPrice = Number(req.body.selling_price)
  console.log('product = ' + productId)
  console.log('quantity = ' + quantity)
  console.log('buyingPrice = ' + buyingPrice)
  console.log('sellingPrice = ' + sellingPrice)
  const Product = Parse.Object.extend('Product')
  const Stock = Parse.Object.extend('Stock')
  const query = new Parse.Query(Product)





  var today = new Date()
  var dd = String(today.getDate()).padStart(2, '0')
  var mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
  var yyyy = today.getFullYear()

  today = dd + '/' + mm + '/' + yyyy

  const Pump = Parse.Object.extend('Pump')
  const pumpQuery = new Parse.Query(Pump)
  var pumpAccount = await pumpQuery.get('KtnxKaEaBH')
  balance = pumpAccount.get('balance')
  var expense = buyingPrice * quantity
  console.log(expense)

  pumpAccount
    .set('balance', balance - Number(expense))
    .save()
    .then(res => {
      console.log('Account Balance saved')
    })
    .catch(err => {
      console.log(err)
    })

  note = req.body.note
  const AccountTransaction = Parse.Object.extend('AccountTransaction')
  const accountTrans = new AccountTransaction()
  accountTrans.set('date', today)
  accountTrans.set('note', "stock purchase")
  accountTrans.set('deposit', 0)
  accountTrans.set('withdrawal', expense)
  accountTrans.set('oldBalance', balance)
  accountTrans.set('newBalance', balance - Number(expense))
  accountTrans
    .save()
    .then(res => {
      console.log('accountTrans saved')
    })
    .catch(err => {
      console.log(err)
    })

  query
    .get(productId)
    .then(product => {
      console.log(product)
      const stock = new Stock()
      stock.set('product', product)
      stock.set('quantity', quantity)
      stock.set('buyingPrice', buyingPrice)
      stock.set('sellingPrice', sellingPrice)
      stock
        .save()
        .then(result => {
          res.redirect('/stock/view_stock')
        })
        .catch(err => {
          // render error view here
        })

    })
    .catch(err => {
      console.log(err)
    })



})

router.post('/:stockId', async function (req, res, next) {
  const stockId = req.params.stockId
  const addedQuantity = Number(req.body.addedQuantity)
  var bp, expense, balance
  console.log(stockId)
  console.log(addedQuantity)
  const Stock = Parse.Object.extend('Stock')
  const query = new Parse.Query(Stock)

  Parse.User.enableUnsafeCurrentUser()
  Parse.User.currentAsync().then(async function (user) {
    if (user.get('role') == 'admin') {
      await query
        .get(stockId)
        .then(stock => {
          console.log(JSON.stringify(stock))
          const currentQuantity = Number(stock.get('quantity'))
          bp = Number(stock.get('buyingPrice'))
          const newQuantity = currentQuantity + addedQuantity
          console.log(newQuantity)
          stock.set('quantity', newQuantity)
          stock
            .save()
            .then(result => {
              // res.redirect('/stock/view_stock')
              console.log('Success')
            })
            .catch(err => {
              console.log(err)
            })
        })
        .catch(err => {
          console.log(err)
          // res.redirect('/stock/view_stock')
        })


      var today = new Date()
      var dd = String(today.getDate()).padStart(2, '0')
      var mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
      var yyyy = today.getFullYear()

      today = dd + '/' + mm + '/' + yyyy

      const Pump = Parse.Object.extend('Pump')
      const pumpQuery = new Parse.Query(Pump)
      expense = bp * addedQuantity
      console.log('expense type' + typeof expense)

      await pumpQuery
        .get('KtnxKaEaBH')
        .then(account => {
          balance = Number(account.get('balance'))
          console.log('balance type ' + typeof balance)
          account.set('balance', balance - Number(expense))
          account
            .save()
            .then(res => {
              console.log('Account Balance saved')
            })
            .catch(err => {
              console.log(err)
            })

        })


      const AccountTransaction = Parse.Object.extend('AccountTransaction')
      const accountTrans = new AccountTransaction()
      accountTrans.set('date', today)
      accountTrans.set('note', "stock purchase")
      accountTrans.set('deposit', 0)
      accountTrans.set('withdrawal', expense)
      accountTrans.set('oldBalance', balance)
      accountTrans.set('newBalance', balance - Number(expense))
      await accountTrans
        .save()
        .then(result => {
          console.log('accountTrans saved')
          res.redirect('/stock/view_stock')
        })
        .catch(err => {
          console.log(err)
        })

    } else {
      res.render('opps/oppsPage')
    }
  })
  // console.log(" Stock user role 1234*** " + role)
  // if (role == 'admin') {
  //   console.log('got into if ')


  // }


})

router.get('/modify_stock', function (req, res) {
  const Stock = Parse.Object.extend('Stock')
  const query = new Parse.Query(Stock)
  query.include('product')
  Parse.User.enableUnsafeCurrentUser()
  Parse.User.currentAsync().then(function (user) {
    // do stuff with your user
    if (user) {
      console.log(
        'user found >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>        ' +
        user.role
      )
      console.log('user found ' + user.id)
      if (user.get('role') == 'admin') {
        query
          .find()
          .then(result => {
            // console.log(JSON.stringify(result))
            res.render('stock/modify_stock', { stocks: result })
          })
          .catch(err => {
            res.render('stock/modify_stock', { error: err })
          })
      } else {
        res.render('opps/oppsPage')
      }
    }
  })
})

router.post('/stock/stockUpdate', function (req, res) {
  console.log('modify route working working')
  const Stock = Parse.Object.extend('Stock')
  const query = new Parse.Query(Stock)
  console.log('modify route working working')
  var id = req.body.stkId
  var bp = req.body.buying_price
  var sp = req.body.selling_price
  console.log('modify%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
  console.log(' SP ' + sp)
  console.log(' BP ' + bp)
  console.log(' id ' + id)
  console.log('modify%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')

  // Parse.User.enableUnsafeCurrentUser()
  // Parse.User.currentAsync().then(function (user) {
  //   // do stuff with your user
  //   if (user) {
  //     console.log(
  //       'user found >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>        ' +
  //         user.role
  //     )
  //     console.log('user found ' + user.id)
  //     if (user.get('role') == 'admin') {
  query
    .get(id)
    .then(stock => {
      console.log(stock)
      stock.set('buyingPrice', Number(bp))
      stock.set('sellingPrice', Number(sp))
      stock
        .save()
        .then(result => {
          console.log('saved price')
          res.redirect('/stock/modify_stock')
        })
        .catch(err => {
          res.redirect('/stock/modify_stock')
          console.log(err)
        })
    })
    .catch(err => {
      console.log(err)
    })
  //     } else {
  //       res.render('opps/oppsPage')
  //     }
  //   }
  // })
})

module.exports = router
