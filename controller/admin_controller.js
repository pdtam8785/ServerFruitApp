// controllers/adminController.js
const mongoose = require('mongoose');
const orderModel = require('../models/order_models');
// Giả sử bạn có các model Product và User để kiểm tra product_id và user_id
const productModel = require("../models/product_models"); // Import model Product
const { userModel } = require("../models/user_models"); // Import model User (đúng cách)
const bcrypt = require('bcrypt'); // Đảm bảo import đúng
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
      next();
  } else {
      res.redirect('/login');
  }
};

// Hiển thị trang đăng nhập
const getLogin = (req, res) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
      return res.redirect('/home');
  }
  res.render('admin/login', { title: 'Đăng nhập Admin' });
};
// Xử lý đăng nhập
const postLogin = async (req, res) => {
  try {
      const { email, password } = req.body;
      const user = await userModel.findOne({ email }).lean();
      if (!user) {
          return res.render('admin/login', { title: 'Đăng nhập Admin', error: 'Email không tồn tại' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.render('admin/login', { title: 'Đăng nhập Admin', error: 'Mật khẩu không đúng' });
      }
      if (user.role !== 'admin') {
          return res.render('admin/login', { title: 'Đăng nhập Admin', error: 'Bạn không có quyền truy cập' });
      }
      if (req.session) {
          req.session.user = user; // Lưu thông tin user vào session
      } else {
          console.error('Session is undefined');
          return res.status(500).send('Lỗi server: Session không khả dụng');
      }
      res.redirect('/home');
  } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      res.status(500).send('Lỗi server: ' + error.message);
  }
};

// Xử lý đăng xuất
const logout = (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).send('Lỗi khi đăng xuất');
      }
      res.redirect('/login');
  });
};
const getAdminDashboard = async (req, res) => {
  try {
      const totalOrders = await orderModel.countDocuments();
      const totalUsers = await userModel.countDocuments();
      const todayRevenue = await orderModel.aggregate([
          { $match: { created_at: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
          { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]);
      const newProducts = await productModel.countDocuments({ created_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });

      res.render('admin/index', {
          title: 'Admin Panel',
          totalOrders,
          totalUsers,
          todayRevenue: todayRevenue[0]?.total || 0,
          newProducts,
          user: req.session ? req.session.user : null // Truyền user vào template
      });
  } catch (error) {
      res.status(500).send('Lỗi server: ' + error.message);
  }
};

const getOrders = async (req, res) => {
  try {
      const orders = await orderModel.find().populate('user_id', 'delivery_address phone_number email').lean();
      orders.forEach(order => {
          order.userEmail = order.user_id?.email || 'Không có email';
      });
      res.render('admin/orders', { title: 'Quản lý Đơn hàng', orders });
  } catch (error) {
      res.status(500).send('Lỗi server: ' + error.message);
  }
};
const getOrderDetail = async (req, res) => {
  try {
      const order = await orderModel.findById(req.params.id).populate('user_id', 'delivery_address phone_number email').lean();
      if (!order) {
          return res.status(404).send('Đơn hàng không tồn tại');
      }
      res.render('admin/order_detail', { title: 'Chi tiết Đơn hàng', order });
  } catch (error) {
      res.status(500).send('Lỗi server: ' + error.message);
  }
};
const updateOrderStatus = async (req, res) => {
  try {
      const { status } = req.body;
      const orderId = req.params.id;
      console.log('Received orderId:', orderId, 'status:', status); // Thêm log để debug
      const order = await orderModel.findById(orderId);
      if (!order) {
          return res.status(404).send('Đơn hàng không tồn tại');
      }
      if (![0, 1, 2, 3, 4, 5].includes(Number(status))) {
          return res.status(400).send('Trạng thái không hợp lệ');
      }
      order.status = Number(status);
      await order.save();
      res.redirect('/getOrders');
  } catch (error) {
      res.status(500).send('Lỗi server: ' + error.message);
  }
};

const getProducts = async (req, res) => {
  try {
      const products = await productModel.find().populate('category_id', 'name').lean();
      res.render('admin/products', { title: 'Quản lý Sản phẩm', products, user: req.session ? req.session.user : null });
  } catch (error) {
      res.status(500).send('Lỗi server: ' + error.message);
  }
};

// Hiển thị chi tiết sản phẩm
const getProductDetail = async (req, res) => {
  try {
      const product = await productModel.findById(req.params.id).populate('category_id', 'name').lean();
      if (!product) {
          return res.status(404).send('Sản phẩm không tồn tại');
      }
      res.render('admin/product_detail', { title: 'Chi tiết Sản phẩm', product, user: req.session ? req.session.user : null });
  } catch (error) {
      res.status(500).send('Lỗi server: ' + error.message);
  }
};

// Hiển thị form thêm sản phẩm
const getAddProduct = async (req, res) => {
  try {
      const categories = await mongoose.model('categorys').find().lean();
      res.render('admin/add_product', { title: 'Thêm Sản phẩm', categories, user: req.session ? req.session.user : null });
  } catch (error) {
      res.status(500).send('Lỗi server: ' + error.message);
  }
};

// Xử lý thêm sản phẩm
const postAddProduct = async (req, res) => {
  try {
      const { name, price, category_id, description, image } = req.body;
      const newProduct = new productModel({
          name,
          price: parseFloat(price),
          category_id,
          description,
          image
      });
      await newProduct.save();
      res.redirect('/getProducts');
  } catch (error) {
      res.status(500).send('Lỗi server: ' + error.message);
  }
};

// Hiển thị form sửa sản phẩm
const getEditProduct = async (req, res) => {
  try {
      const product = await productModel.findById(req.params.id).populate('category_id', 'name').lean();
      if (!product) {
          return res.status(404).send('Sản phẩm không tồn tại');
      }
      const categories = await mongoose.model('categorys').find().lean();
      res.render('admin/edit_product', { title: 'Sửa Sản phẩm', product, categories, user: req.session ? req.session.user : null });
  } catch (error) {
      res.status(500).send('Lỗi server: ' + error.message);
  }
};

// Xử lý sửa sản phẩm
const postEditProduct = async (req, res) => {
  try {
      const { name, price, category_id, description, image } = req.body;
      const product = await productModel.findById(req.params.id);
      if (!product) {
          return res.status(404).send('Sản phẩm không tồn tại');
      }
      product.name = name;
      product.price = parseFloat(price);
      product.category_id = category_id;
      product.description = description;
      product.image = image;
      await product.save();
      res.redirect('/getProducts');
  } catch (error) {
      res.status(500).send('Lỗi server: ' + error.message);
  }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
      const product = await productModel.findByIdAndDelete(req.params.id);
      if (!product) {
          return res.status(404).send('Sản phẩm không tồn tại');
      }
      res.redirect('/getProducts');
  } catch (error) {
      res.status(500).send('Lỗi server: ' + error.message);
  }
};
const getUsers = async (req, res) => {
  try {
      const users = await userModel.find().lean();
      console.log('Users data:', users);
      res.render('admin/users', { // Render file users.hbs
          title: 'Quản lý Người dùng',
          users,
          user: req.session ? req.session.user : null
      });
  } catch (error) {
      res.status(500).send('Lỗi server: ' + error.message);
  }
};

const getReports = async (req, res) => {
  try {
      // Lấy tất cả đơn hàng
      const orders = await orderModel.find().lean();

      // Tính tổng doanh thu (chỉ tính đơn đã giao hàng - status = 3)
      let totalRevenue = 0;
      orders.forEach(order => {
          if (order.status === 3) { // Đã giao hàng
              totalRevenue += order.total_amount || 0; // Dùng total_amount thay vì total
          }
      });

      // Thống kê theo ngày, tháng, năm
      const dailyStats = {};
      const monthlyStats = {};
      const yearlyStats = {};

      orders.forEach(order => {
          // Kiểm tra và xử lý created_at
          if (!order.created_at) {
              console.warn(`Missing created_at for order ${order._id}: ${JSON.stringify(order)}`);
              return; // Bỏ qua nếu không có created_at
          }

          let orderDate;
          try {
              orderDate = new Date(order.created_at);
              if (isNaN(orderDate.getTime())) {
                  console.warn(`Invalid date for order ${order._id}: ${order.created_at}`);
                  return; // Bỏ qua nếu không hợp lệ
              }
          } catch (e) {
              console.warn(`Error parsing date for order ${order._id}: ${order.created_at}`, e);
              return; // Bỏ qua nếu lỗi
          }

          const dayKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD
          const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
          const yearKey = `${orderDate.getFullYear()}`; // YYYY

          // Khởi tạo nếu chưa có
          if (!dailyStats[dayKey]) {
              dailyStats[dayKey] = { completed: 0, inProgress: 0 };
          }
          if (!monthlyStats[monthKey]) {
              monthlyStats[monthKey] = { completed: 0, inProgress: 0 };
          }
          if (!yearlyStats[yearKey]) {
              yearlyStats[yearKey] = { completed: 0, inProgress: 0 };
          }

          // Phân loại trạng thái đơn hàng
          if (order.status === 3) { // Đã giao hàng
              dailyStats[dayKey].completed += 1;
              monthlyStats[monthKey].completed += 1;
              yearlyStats[yearKey].completed += 1;
          } else if ([0, 1, 2].includes(order.status)) { // Chờ xác nhận, Chờ lấy hàng, Chờ giao hàng
              dailyStats[dayKey].inProgress += 1;
              monthlyStats[monthKey].inProgress += 1;
              yearlyStats[yearKey].inProgress += 1;
          }
      });

      // Chuyển thành mảng để dễ xử lý
      const dailyStatsArray = Object.keys(dailyStats)
          .map(date => ({
              date,
              completed: dailyStats[date].completed,
              inProgress: dailyStats[date].inProgress
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

      const monthlyStatsArray = Object.keys(monthlyStats)
          .map(month => ({
              month,
              completed: monthlyStats[month].completed,
              inProgress: monthlyStats[month].inProgress
          }))
          .sort((a, b) => a.month.localeCompare(b.month));

      const yearlyStatsArray = Object.keys(yearlyStats)
          .map(year => ({
              year,
              completed: yearlyStats[year].completed,
              inProgress: yearlyStats[year].inProgress
          }))
          .sort((a, b) => a.year.localeCompare(b.year));

      // Tổng số liệu
      const stats = {
          productCount: await productModel.countDocuments(),
          orderCount: await orderModel.countDocuments(),
          userCount: await userModel.countDocuments(),
          totalRevenue // Thêm tổng doanh thu
      };

      res.render('admin/reports', {
          title: 'Thống kê',
          stats,
          dailyStats: dailyStatsArray,
          monthlyStats: monthlyStatsArray,
          yearlyStats: yearlyStatsArray,
          user: req.session ? req.session.user : null
      });
  } catch (error) {
      res.status(500).send('Lỗi server: ' + error.message);
  }
};
module.exports = {
  isAdmin,
  getLogin,
    postLogin,
    logout,
  getAdminDashboard,
  getOrders,
  getOrderDetail,
  updateOrderStatus,
  getProducts,         // Thêm
    getProductDetail,   // Thêm
    getAddProduct,      // Thêm
    postAddProduct,     // Thêm
    getEditProduct,     // Thêm
    postEditProduct,    // Thêm
    deleteProduct ,      // Thêm
    getReports,
    getUsers,
};