var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
require('../schema');
var PermUser = mongoose.model('PermUser');
var a = require('../auth');

/* GET users listing. */

router.use('/verify', a.authenticate_token);

router.post('/', function(req, res, next) {
  	a.configure({
		userModel: PermUser,
		userInputOption: {
			email: req.body.email,
			password: req.body.password
		},
		usermodelFieldName: 'email',
		mailOption: {
			from: 'krisalay@gmail.com',
			to: req.body.email,
	        subject: 'Please confirm account',
	        html: 'Click the following link to confirm your account:</p><p>@{{URL}}</p>',
	        text: 'Please confirm your account by clicking the following link: @{{URL}}'
		},
		transportOption: {
			service: 'Gmail',
			auth: {
				user: 'corooms0059@gmail.com',
				pass: 'friendsandco@110059'
			}
		},
		passwordToSecureUrl: 'password_secure',
		request:req,
		verificationRoutePath: '/users/verify'
	}).then(function(response_result){
		console.log(response_result);
	});
});

router.get('/verify', function(req, res, next) {
	if(req.decoded){
		res.json({success: true, msg: 'account activated successfully'});
	}else{
		res.json({success: false, msg: 'The requested url is not valid'});
	}
});

module.exports = router;
