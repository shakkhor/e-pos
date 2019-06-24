var express = require('express')
var router = express.Router()
var Parse = require('parse/node')

router.get('/addNewUser', function (req, res) {
    Parse.User.enableUnsafeCurrentUser()
    Parse.User.currentAsync().then(function (user) {
        // do stuff with your user
        if (user) {
            console.log('user found >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>        ' + user.get('role'))
            console.log('user found ' + user.id)
            if (user.get('role') == 'admin') {
                res.render('users/addNewUser')
            }
            else {
                res.render('opps/oppsPage')
            }
        }
    })
})

// router.get('/addFirstUser', function (req, res) {
//     res.render('users/addNewUser')
            
// })

router.post('/insertInDb', function (req, res) {
    let fullName = req.body.fullName
    let userName = req.body.username
    // var email = req.body.username
    let password = req.body.password
    let role = req.body.role
    var newUser = new Parse.User()


    console.log(fullName)
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    console.log(userName)
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    console.log(password)
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    console.log(role)
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    // var adminUser
    // Parse.User.currentAsync().then(function (user) {
    //     console.log(user)
    //     adminUser = user
    // })

    newUser.set('username', userName)
    // newUser.set('email', email)
    newUser.set('password', password)
    newUser.set('fullName', fullName)
    newUser.set('role', role)
    newUser
        .save()
        .then(result => {
            console.log(result)
            // Parse.User.currentAsync().then(function (user) {
            //     console.log(user)
            //     user = adminUser
            //     console.log(user)
            // })

            res.render('users/addNewUser', { message: result.message })
        })
        .catch(err => {
            console.log(err)
            res.render('users/addNewUser', { message: err.message })
        })

})

router.get('/currentUsers', function (req, res) {
    const Users = Parse.Object.extend('User')
    const query = new Parse.Query(Users)

    query
        .find()
        .then(result => {
            res.render('users/currentUsers', { users: result })
        })
        .catch(err => {
            console.log(err)
        })
})


module.exports = router
