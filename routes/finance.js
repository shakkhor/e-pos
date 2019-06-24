var express = require('express')
var router = express.Router()
var Parse = require('parse/node')

router.get('/accountUpdate', async function (req, res) {
  const Pump = Parse.Object.extend('Pump')
  const pumpQuery = new Parse.Query(Pump)
  var pumpAccount = await pumpQuery.first()
  balance = pumpAccount.get('balance')
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
        res.render('account/accountUpdate', { balance: balance })
      } else {
        res.render('opps/oppsPage')
      }
    }
  })
})

router.get('/accountStatus', async function (req, res) {
  const Pump = Parse.Object.extend('Pump')
  const pumpQuery = new Parse.Query(Pump)
  var pumpAccount = await pumpQuery.first()

  res.render('account/accountStatus', { account: pumpAccount })
})

router.get('/accountExpenses', async function (req, res) {
  res.render('account/accountExpenses')
})

router.post('/close', async function (req, res, next) {
  const Pump = Parse.Object.extend('Pump')
  const pumpQuery = new Parse.Query(Pump)
  var pumpAccount = await pumpQuery.first()

  pumpAccount.set('opBalance', Number(pumpAccount.get('balance')))
  pumpAccount
    .save()
    .then(result => {
      res.redirect('/account/accountStatus')
      console.log('Account Closed')
    })
    .catch(err => {
      console.log(err)
    })
})

router.post('/expense', async function (req, res, next) {
  console.log('working')

  var today = new Date()
  var dd = String(today.getDate()).padStart(2, '0')
  var mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
  var yyyy = today.getFullYear()

  today = dd + '/' + mm + '/' + yyyy

  const Pump = Parse.Object.extend('Pump')
  const pumpQuery = new Parse.Query(Pump)
  var pumpAccount = await pumpQuery.first()
  balance = pumpAccount.get('balance')
  var expense = parseFloat(req.body.expense)
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
  accountTrans.set('note', note)
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

  res.redirect('/account/accountExpenses')
})

router.post('/update', async function (req, res, next) {
  console.log('working')

  var today = new Date()
  var dd = String(today.getDate()).padStart(2, '0')
  var mm = String(today.getMonth() + 1).padStart(2, '0') // January is 0!
  var yyyy = today.getFullYear()

  today = dd + '/' + mm + '/' + yyyy

  const Pump = Parse.Object.extend('Pump')
  const pumpQuery = new Parse.Query(Pump)
  var pumpAccount = await pumpQuery.first()
  balance = pumpAccount.get('balance')
  var expense = parseFloat(req.body.expense)
  console.log(expense)

  await pumpAccount
    .set('balance', balance + Number(expense))
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
  accountTrans.set('note', 'cash Added')
  accountTrans.set('deposit', expense)
  accountTrans.set('withdrawal', 0)
  accountTrans.set('oldBalance', balance)
  accountTrans.set('newBalance', balance + Number(expense))
  await accountTrans
    .save()
    .then(res => {
      console.log('accountTrans saved')
    })
    .catch(err => {
      console.log(err)
    })
  res.redirect('/account/accountUpdate')
})

module.exports = router
