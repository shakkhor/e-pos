var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
var logger = require('morgan')
var bodyParser = require('body-parser')
var Parse = require('parse/node')
var authChecker = require('./authChecker')
var asyncStorage = require('async-local-storage')

Parse.Promise = global.Promise
Parse.setAsyncStorage(asyncStorage)

Parse.initialize('zDmdrUrvD3WFdIM4', '', 'TtW6WcNARzGvVbBN')
Parse.serverURL = 'https://bppbackend.herokuapp.com/api'


// app
var app = express()
// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
// modules
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// Cookie and session handaling
app.use(
  cookieSession({
    name: 'your-token-name',
    secret: 'your-token-secret',
    maxAge: 15724800000
  })
)
app.use(cookieParser('42345235235325235235'))
//
app.use(express.static(path.join(__dirname, 'public')))
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
app.use(bodyParser.json())
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With,Accept,Content-Type, Authorization'
  )
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE')
    return res.status(200).json({})
  }
  next()
})
// account router before auth checking to avoid deadlock
var accountRouter = require('./routes/account')
app.use('/account', accountRouter)
// auth before route
app.use(authChecker) // ######################################
/// ### route ###
var billRouter = require('./routes/bill')
var customerRouter = require('./routes/customer')
var productRouter = require('./routes/product')
var stockRouter = require('./routes/stock')
var vehicleRouter = require('./routes/vehicle')
var indexRouter = require('./routes/index')
var usersRouter = require('./routes/manageUsers')
var reportRouter = require('./routes/report')
var ajaxRouter = require('./routes/ajax')
var financeAccountRouter = require('./routes/finance')
var discountRouter = require('./routes/discount')

app.use('/report', reportRouter)
app.use('/bill', billRouter)
app.use('/customer', customerRouter)
app.use('/product', productRouter)
app.use('/stock', stockRouter)
app.use('/vehicle', vehicleRouter)
app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/ajax', ajaxRouter)
app.use('/account', financeAccountRouter)
app.use('/discount', discountRouter)

// error handling
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})
// error handler

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(404).render('opps/404.ejs')
})
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json({
    error: {
      message: err.message
    }
  })
})

module.exports = app
