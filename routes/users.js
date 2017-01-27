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
			from: '<email>',
			to: req.body.email,
	        subject: 'Please confirm account',
	        html: 'Click the following link to confirm your account:</p><p>@{{URL}}</p>',
	        text: 'Please confirm your account by clicking the following link: @{{URL}}'
		},
		transportOption: {
			service: 'Gmail',
			auth: {
				user: '<youremail@gmail.com>',
				pass: '<your_password>'
			}
		},
		request:req,
		verificationRoutePath: '/users/verify'
	}).then(function(response_result){
		console.log(response_result);
		res.json(response_result);
	});
});

router.get('/verify', function(req, res, next) {
	a.verify(req,PermUser,'email').then(function(response_verification){
		console.log(response_verification);
		res.json(response_verification);
	});
});

module.exports = router;
