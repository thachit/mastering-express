var fs = require('fs');
var createError = require('http-errors');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var express = require('express');
var app = express();

app.use('/user/:id', function(req, res, next){
	console.log('Request URL: ', req.originalUrl);
	next();
}, function (req, res, next){
	console.log('Request Type: ', req.method);
	res.send("ok");
})

app.get("/", function(req, res, next){
	fs.readFile("./man.txt", function(err, data){
		if(err) {
			next(err);
		}
		else{
			res.send(data);
		}
	})
})

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json());
app.use(methodOverride());
app.use(function(err, req, res, next){
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err: {};

	// render the error page
	res.status(err.status || 500);
	res.json(err);
})

app.listen(3000, function(){
	console.log('Example app listening on port 3000!')	
})