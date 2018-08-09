var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var passport = require('passport');
var authenticate = require('./authenticate'); // config the passport
var charityAuthenticate = require('./charityAuthenticate'); // config the passport

var config = require('./config');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var charityRouter = require('./routes/charityRouter');
var coverPicRouter = require('./routes/coverPicRouter');
var favoriteRouter = require('./routes/favoriteRouter');
var uploadRouter = require('./routes/uploadRouter');
var searchRouter = require('./routes/searchRouter');
var categoriesRouter = require('./routes/categoriesRouter');
var paymentDetailsRouter = require('./routes/paymentDetailsRouter');
var charityUserRouter = require('./routes/charityUserRouter');
var paymentRouter = require('./routes/paymentRouter');
var donationRouter = require('./routes/donationRouter');
var volunteerRouter = require('./routes/volunteerRouter');

var app = express();

// connect to mongodb
var url = config.mongoUrl;
const connect = mongoose.connect(url);
//Mongoose creates a default connection when you call mongoose.connect().
//You can access the default connection using mongoose.connection.
connect.then(() => {
     console.log('mongoDB connect successfully');
});


// redirect to secure ports
app.all('*', (req, res, next) =>{
     // request coming through secure port
     if(req.secure){
          next();//do nothing
     }
     else{
          res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
     }
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));



app.use(passport.initialize());
app.use(passport.session());
// app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/charityusers', charityUserRouter);
app.use('/charities', charityRouter);
app.use('/coverpics', coverPicRouter);
app.use('/favorites', favoriteRouter);
app.use('/imageUpload', uploadRouter);
app.use('/search', searchRouter);
app.use('/categories', categoriesRouter);
app.use('/paymentdetails', paymentDetailsRouter);
app.use('/payment', paymentRouter);
app.use('/donation', donationRouter);
app.use('/volunteer', volunteerRouter);

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
