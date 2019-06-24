var mongoose = require('mongoose');

// User Schema creation ........................................
var AddProductSchema = mongoose.Schema({
    product:{
        type: String,
        index: true
    },
    quantity:{
        type: Number
    },
    buying_price:{
        type: String
    },
    selling_price:{
        type: String
    }
});


module.exports = mongoose.model('ProductDetails', AddProductSchema);

module.exports.createProductDetails = function(newDetails, callback){
    newDetails.save(callback);
}
