var mongoose = require('mongoose');

// User Schema creation ........................................
var AddVehicleSchema = mongoose.Schema({
    company_name:{
        type: String,
        index: true
    },
    registration:{
        type: String
    },
    vehicle_type:{
        type: String
    },
    color:{
        type: String
    },
    driver:{
        type: String
    },
    driver_no:{
        type: String
    },    
    datetime:{
      type: String
    }
});


module.exports = mongoose.model('VehicleDetails', AddVehicleSchema);

module.exports.createVehicleDetails = function(newDetails, callback){
    newDetails.save(callback);
}
