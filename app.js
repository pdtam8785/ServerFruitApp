const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('hbs');
const methodOverride = require('method-override');
const session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var userRouter = require('./routes/user_routes');
var productRouter = require('./routes/product_routes');
var category_routes = require('./routes/category_routes');
var orderItem_routes = require('./routes/orderItem_routes');
var order_routes = require('./routes/order_routes');
var adminRouter = require('./routes/admin_routes');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Handlebars helpers (đăng ký một lần duy nhất)
hbs.registerHelper('lookupStatus', function(status) {
    const statusMap = {
        0: 'Chờ xác nhận',
        1: 'Chờ lấy hàng',
        2: 'Chờ giao hàng',
        3: 'Đã giao hàng',
        4: 'Trả hàng',
        5: 'Đã hủy'
    };
    return statusMap[status] || 'Không xác định';
});

hbs.registerHelper('formatDate', function(date) {
    return new Date(date).toLocaleDateString('vi-VN');
});

hbs.registerHelper('formatCurrency', function(amount) {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
});
hbs.registerPartials(path.join(__dirname, './views/partials'));
// Middleware
app.use(logger('dev'));
app.use(express.json()); // Đặt sau session
app.use(express.urlencoded({ extended: false })); // Đặt sau session
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình express-session (đặt trước các route và middleware xử lý request)
app.use(session({
    secret: 'a-very-strong-secret-key-123456', // Thay bằng key ngẫu nhiên và an toàn (VD: crypto.randomBytes(32).toString('hex'))
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Đặt secure: true nếu dùng HTTPS
}));

app.use(methodOverride('_method'));

// Debug middleware
app.use((req, res, next) => {
    console.log('Request:', req.method, req.url);
    console.log('Session:', req.session); // Debug để kiểm tra session
    next();
});

// Routes
app.use('/in', indexRouter);
app.use('/users', usersRouter);
app.use('/user', userRouter);
app.use('/product', productRouter);
app.use('/category', category_routes);
app.use('/orderItem', orderItem_routes);
app.use('/order', order_routes);
app.use('/', adminRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;