var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//Database
var db = require('mongoose');
db.set('strictQuery', false); //to avoid the warning message 
db.connect('mongodb://mongodb/workshop5', {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(err => {
    console.log("MongoDB connection error: "+err); 
  });

//Set the Schema
var mySchema = new db.Schema({
  category: String,
  name: String,
  status: String
});

//Create my model
var commodity = db.model("commodity", mySchema, "commodities");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our model accessible to routers 
app.use(function(req,res,next) {
  req.commodity = commodity;
  next(); 
});
 
app.use('/', indexRouter);
app.use('/users', usersRouter);

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
