var mongoose = require("mongoose");
var config = require("../config.json");

exports.isValidationError = function(err) {
	return ((err.name == 'ValidationError') || (err.message.indexOf('ValidationError') !== -1));
};

exports.isDuplicateKeyError = function(err) {
	return (err.message.indexOf('duplicate key') !== -1)
};

exports.connect = ""/* database connection function extracted from
app.js should move here */


