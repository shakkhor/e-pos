var mongoose = require('mongoose');

// User Schema creation ........................................
var BillSchema = mongoose.Schema({
    email:{
        type: String,
        index: true
    },
    vehicle:{
        type: String
    },
    company:{
        type: String
    },
    product:{
        type: String
    },
    quantity:{
        type: String
    },
    price: {
        type: String
    },
    discount:{
        type: String
    },
    total_price:{
        type: String
    },
    datetime:{
      type: String
    }
});


module.exports = mongoose.model('BillDetails', BillSchema);  // 'CoinDetails' hocce collection name ...

module.exports.createBillDetails = function(newDetails, callback){
    newDetails.save(callback);
}
