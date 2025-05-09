var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var userRouter = require("./routes/user_routes"); // real ko s
var productRouter = require("./routes/product_routes");
var category_routes = require("./routes/category_routes");
var orderItem_routes = require("./routes/orderItem_routes");
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Thành:
//app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/user',userRouter);//người dùng
app.use('/product',productRouter); // sản phẩm
app.use('/category',category_routes);
app.use('/orderItem',orderItem_routes);
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
