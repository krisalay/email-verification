var express = require('express');
var app = express();
var bCrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var config = require('./config');


//app.set('jwtsecret',config.JWT_SECRET);

module.exports = {

	generate_token: function(arg_json_object,arg_expires_in){
		var token = jwt.sign(arg_json_object, config.VERIFICATION_URL_SECRET,{
			expiresIn: arg_expires_in
		});
		return token;
	},

	authenticate_token: function(req,res,next){
		var token = req.body.token || req.query.token || req.header['x-access-token'];

		if(token){
			jwt.verify(token, config.VERIFICATION_URL_SECRET, function(err,decoded){
				if(err){
					console.log('ERROR: failed to authenticate token');
					res.json({success: false, message: 'failed to authenticate token'});
				}else{
					req.decoded = decoded;
					next();
				}
			});
		}else{
			res.status(403).send({
				success: false,
				message: 'No token provided'
			});
		}
	},

	check_existence_of_data_in_collection: function(collection_name, field_name, field_value){
		if(!collection_name || !field_name || !field_value){
			return false;
		}
		return new Promise(function(resolve,reject){
			collection_name.find().where(field_name,field_value).exec(function(error_existance_of_data_in_collection, response_existence_of_data_in_collection){
				if(error_existance_of_data_in_collection){
					console.log(error_existance_of_data_in_collection);
					resolve({success:false,data:error_existance_of_data_in_collection});
				}else{
					if(response_existence_of_data_in_collection.length){
						resolve({success:true,data:response_existence_of_data_in_collection});
					}else{}
					resolve({success:false,data:['null']});
				}
			});
		});
	},

	remove_doc_in_collection: function(collection_name, field_key_value_object){
		if(!collection_name || !field_key_value_object){
			return false;
		}
		collection_name.remove(field_key_value_object, function(error_removing_doc_from_db, response_removing_data_from_db){
			if(error_removing_doc_from_db){
				console(error_removing_doc_from_db);
			}else{
				//console.log(response_removing_data_from_db.result);
			}
		});
	},

	generate_verification_url: function(arg_req, arg_user_object, arg_url_expiration_time,route_path){
		var full_verification_token = module.exports.generate_token(arg_user_object,arg_url_expiration_time);
		var url = arg_req.protocol + '://' + arg_req.get('host') + route_path +'?token=' + full_verification_token;
		return url;
	},

	isPasswordValid: function(user, password ){
		return bCrypt.compareSync(password, user.pass);
	},
	createHash: function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	}
};