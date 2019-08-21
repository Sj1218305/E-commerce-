var mongoose = require('mongoose');
var passportLocalMongoose 	= require('passport-local-mongoose');

	var detailsSchema = new mongoose.Schema({
	firstName: String,
	lastName: String,
	pincode : Number,
	address : String,
	state : String,
	country : String,
	number1 : Number,
	number2 : Number
});
	
detailsSchema.plugin(passportLocalMongoose);  

module.exports = mongoose.model("Details", detailsSchema);