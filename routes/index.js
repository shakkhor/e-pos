var express = require("express");
var router = express.Router();
var Parse = require("parse/node");

router.get("/", function(req, res) {
  res.render("home/welcome");
});

router.get("/logout", function(req, res) {
  console.log("logging out");
  Parse.User.logOut()
    .then(result => {
      console.log(result);
      res.redirect("/");
    })
    .catch(err => {
      console.log(err);
      res.redirect("/");
    });
});

module.exports = router;
