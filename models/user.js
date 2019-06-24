var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema creation ........................................
var UserSchema = mongoose.Schema({
    email:{
        type: String,
        index: true
    },
    location:{
        type: String
    },
    password: {
        type: String
    },
    name: {
        type: String
    },
    approved:{
      type: Boolean
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

// some changing in values to store in db
module.exports.createUser = function(newUser, callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
    newUser.save(callback);
}

module.exports.getUserByUsername = function(username, callback){
    var query = {username: username};
    User.findOne(query, callback);
}

module.exports.getUserByEmail = function(email, callback){
    var query = {email: email};
    User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if(err) throw err;
        callback(null, isMatch);
    });
}

module.exports.getUserByID = function(id, callback){
    User.findById(id, callback);
}

// module.exports.checkErrors = function()
