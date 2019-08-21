var mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
	name: String,
	image: String,
	actualPrice: String,
	sellingPrice: String,
	discount: String,
	category: String,
	created: {type: Date, default: Date.now},
	});
module.exports = mongoose.model("Product",productSchema);