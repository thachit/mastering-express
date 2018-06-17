'use strict'

var User = require('../models/user');

exports.new = function(req, res, next){
	res.render('session/new', {
		info:req.flash('info')[0],
		error: req.flash('error')[0]
	})
};

exports.create = function(req, res, next){
	User.authenticate(req.body.username,req.body.password, function(err, userData){
		if(err) { return next(err); }

		if(userData !== false){
			req.session.username = userData.username;
			req.session.userId = userData._id;
			res.redirect('/');
		} else {
			req.flash('error', 'Bad Username / password');
			res.redirect('/session/new');
		};
	})
};

exports.detroy = function(req, res, next) {
	delete req.session.username;
	delete req.session.userId;

	req.flash('info', 'You have successfully logged out');
	res.redirect('/sessions/new');
}
