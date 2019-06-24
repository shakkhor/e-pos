var mongoose = require('mongoose');

// User Schema creation ........................................
var AddCustomerSchema = mongoose.Schema({
    company_name:{
        type: String,
        index: true
    },
    address:{
        type: String
    },
    email:{
        type: String
    },
    contact_person:{
        type: String
    },
    contact_no:{
        type: String
    },    
    datetime:{
      type: String
    }
});


module.exports = mongoose.model('CustomerDetails', AddCustomerSchema);

module.exports.createCustomerDetails = function(newDetails, callback){
    newDetails.save(callback);
}
