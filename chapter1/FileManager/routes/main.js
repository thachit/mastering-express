'use strict'

exports.requireUserAuth = function(req, res, next){
	// Redirect user to login page if they are not logged in
	if(!req.session.username) {
		return res.redirect('/session/new');
	}

	// needed in the layout for displaying the logout button
	res.locals.isLoggedIn = true;

	next();
}