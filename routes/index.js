var express = require('express');
var router = express.Router();
const orderModel = require('../models/order_models');
// Giả sử bạn có các model Product và User để kiểm tra product_id và user_id
const productModel = require("../models/product_models"); // Import model Product
const { userModel } = require("../models/user_models"); // Import model User (đúng cách)

// Middleware kiểm tra quyền admin (giả định)
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') { // Cần triển khai xác thực thực tế (JWT/session)
      next();
  } else {
      res.status(403).send('Quyền truy cập bị từ chối');
  }
};

// Trang chủ admin
router.get('/', isAdmin, async (req, res) => {
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
          newProducts
      });
  } catch (error) {
      res.status(500).send('Lỗi server: ' + error.message);
  }
});
module.exports = router;
