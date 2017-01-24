var express = require('express');
var app = express();
var router = express.Router();
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');

var emailer = require('./emailer');
var script = require('./script');

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
require('./schema');

var TempUser = mongoose.model('TempUser');
var PermUser = mongoose.model('PermUser');

function enterUrlInEmail(str,url){
	str = str.replace(/@{{URL}}/g, url);
	return str;
}



module.exports= {

	configure: function(obj){
		var transport = nodemailer.createTransport(obj.transportOption);
		//var mailOption = obj.mailOption;
		return new Promise(function(resolve,reject){
			script.check_existence_of_data_in_collection(obj.userModel,obj.usermodelFieldName,obj.userInputOption.email).then(function(is_user_perm){
				script.check_existence_of_data_in_collection(TempUser,obj.usermodelFieldName,obj.userInputOption.email).then(function(is_user_temp){
					if(is_user_perm || is_user_temp){
						resolve({success: false, msg: 'Registration failed: User already exists'});
					}else{
						var temp_user = new TempUser();
						temp_user.email = obj.userInputOption.email;
						temp_user.password = script.createHash(obj.userInputOption.password);
						temp_user.activation_url = script.generate_verification_url(obj.request,{email:obj.userInputOption.email},'24h',obj.verificationRoutePath);
						temp_user.save(function(error_saving_temp_user){
							if(error_saving_temp_user){
								console.log(error_saving_temp_user);
								resolve({success: false, msg: 'Error: saving user'});
							}
							obj.mailOption.html = enterUrlInEmail(obj.mailOption.html,temp_user.activation_url);
							obj.mailOption.text = enterUrlInEmail(obj.mailOption.text,temp_user.activation_url);
							//var verification_email_object = emailer.mailOptions('krisalay@gmail.com',temp_user.email,'Activate Account','Hello world',verification_email_template(temp_user.activation_url));
							transport.sendMail(obj.mailOption, function(error,info){
					            if(error){
					                console.log(error);
					                resolve({success:false, msg: 'could not send verification email'});
					            }
					            console.log('Verification Email sent');
					        });
							resolve({success: true, msg: 'User registration successful'});
						});
					}
				});
			});
		});
	},

	authenticate_token: function(req,res,next){
		var token = req.body.token || req.query.token || req.header['x-access-token'];
		if(token){
			jwt.verify(token, 'jwtsecret', function(err,decoded){
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
	}
};