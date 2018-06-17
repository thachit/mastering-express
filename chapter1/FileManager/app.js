var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var config = require('./config.json');

var logger = require('morgan');

var routes = require('./routes');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var db = require('./lib/db');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals = require('./helpers/index');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// Declaring application routes
app.get('/', routes.main.requireUserAuth, routes.files.index);
app.get('/files/:file', routes.main.requireUserAuth, routes.files.show);
app.delete('/files/:file', routes.main.requireUserAuth, routes.files.destroy);
app.post('/files', multiparty(), routes.main.requireUserAuth, routes.files.create);
app.get('/users/new', routes.users.new);
app.post('/users', routes.users.create);
app.get('/sessions/new', routes.sessions.new);
app.post('/sessions', routes.sessions.create);
app.delete('/sessions', routes.sessions.destroy);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
