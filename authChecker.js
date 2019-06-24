var Parse = require('parse/node')
authChecker = function authChecker(req, res, next) {
  console.log('checking auth')
  Parse.User.enableUnsafeCurrentUser()
  // let currentUser = Parse.User.current()
  // if (currentUser) {
  //   console.log('user found ', currentUser)
  //   next()
  // } else {
  //   console.log('user  not found ')
  //   res.redirect('/account/login')
  // }

  Parse.User.become(
    req.session.token ? req.session.token : 'NoTokenFound'
  ).then(
    function (user) {
      // Do something now that we have a Parse.User stored in the "user" var
      if (user) {
        next()
      } else {
        res.redirect('/account/login')
      }
    },
    function (error) {
      console.log(error)
      // res.render('home/login',{ message: 'You are logged out. Please login again' });
      res.redirect('/account/login')
    }
  )
  /*

    console.log("---------------------------------------------------------------------------------------");
    console.log("Hello this is auth checker");
    console.log(Parse.Session.toString());
    Parse.Session.sessionToken().then(res => {
      console.log(res);
    }).catch(e => {
      console.log(e)
    })

    console.log("---------------------------------------------------------------------------------------");
  */

  // Parse.User.currentAsync().then(function (user) {
  //   // do stuff with your user
  //
  //   if (user) {
  //     var User = Parse.Object.extend('User')
  //     const query = new Parse.Query(User)
  //
  //     // console.log('user found >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>        ' + user.get('role'))
  //
  //     console.log('user found ' + user.get('role'))
  //     query
  //         .get(user.id)
  //         .then(user => {
  //           console.log('auth ends ' + user.get('role'))
  //           console.log('auth ends')
  //         })
  //         .catch(err => {
  //           console.log(err)
  //         })
  //     next()
  //   } else {
  //     res.redirect('/account/login')
  //   }
  // })
}
module.exports = authChecker
