var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var temp_user_schema = new Schema({
	email: {type: String, unique: true, index: true},
	password: String,
	activation_url: {type: String, default: null}
});

var permanent_user_schema = new Schema({
	email: {type: String, unique: true, index: true},
	password: String
});

mongoose.model('TempUser', temp_user_schema);
mongoose.model('PermUser', permanent_user_schema);