'use strict'
var express = require('express');

function restrictAccess(req, res, next){
	var ip = req.ip;

	// check if the ip belongs to the server
	// or to a user in the local network
	// meaning his ip starts with 192.168.*

	if(ip == '127.0.0.1' || /^192\.168\./.test(ip)) {
		next();
	} else {
		res.status(403).send('Forbidden!')
	}
}


var app = express();

app.use(restrictAccess);

app.use(function(req, res, next){
	res.send('Hello World');
})

app.listen(7777);