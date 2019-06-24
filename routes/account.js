var express = require('express')
var router = express.Router()
var Parse = require('parse/node')

router.get('/logout', function (req, res) {
  console.log('logging out')
  Parse.User.currentAsync()
    .logOut()
    .then(result => {
      console.log(result)
      res.redirect('/account/login')
    })
    .catch(err => {
      console.log(err)
      res.redirect('/')
    })
})

router.get('/login', function (req, res) {
  redirectIfAlreadyLoggedIn(res)
  message = ''
  res.render('home/login', { message: message })
})

router.post('/login', function (req, res, next) {
  // redirectIfAlreadyLoggedIn(req, res)
  console.log('trying loggig in')
  let userName = req.body.username
  let password = req.body.password
  Parse.User.logIn(userName, password)
    .then(result => {
      req.session.token = result.getSessionToken()
      res.redirect('/')
    })
    .catch(err => {
      // alert('wrong email or password try again')
      console.log(err)
      var message = 'Invalid username/password'
      res.render('home/login', { message: message })
    })
})

// Register
router.get('/register', function (req, res) {
  redirectIfAlreadyLoggedIn(res)
  res.render('home/register', { message: null })
})
router.post('/register', function (req, res) {
  redirectIfAlreadyLoggedIn(res)
  console.log('trying to register')
  let fullName = req.body.fullName
  let userName = req.body.username
  let password = req.body.password
  var user = new Parse.User()
  user.set('username', userName)
  user.set('password', password)
  user.set('fullName', fullName)
  user
    .signUp()
    .then(result => {
      console.log(result)
      res.redirect('/', { message: result.message })
    })
    .catch(err => {
      console.log(err)
      res.render('home/register', { message: err.message })
    })
})

function redirectIfAlreadyLoggedIn(req, res) {
  Parse.User.enableUnsafeCurrentUser()
  Parse.User.become(
    req.session && req.session.token ? req.session.token : 'NoTokenFound'
  )
    .then(
      function (user) {
        // Do something now that we have a Parse.User stored in the "user" var
        if (user) {
        } else {
          res.render('home/login', { message: null })
        }
      },
      function (error) {
        res.render('home/login', { message: null })
      }
    )
    .catch(err => {
      console.log(err)
    })
}

// function redirectIfAlreadyLoggedIn (res) {
//   Parse.User.enableUnsafeCurrentUser()
//   let currentUser = Parse.User.current()
//   if (currentUser) {
//     res.redirect('/')
//   }
// }

module.exports = router
