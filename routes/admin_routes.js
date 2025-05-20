var express = require("express");
var router = express.Router();
const upload = require("../upload");
const AdminControl = require("../controller/admin_controller");
// Debug route
router.use((req, res, next) => {
    console.log('Admin route:', req.method, req.url);
    next();
});


router.get('/login', AdminControl.getLogin);
router.post('/login', AdminControl.postLogin);
router.get('/logout', AdminControl.logout);
router.get('/home',AdminControl.isAdmin, AdminControl.getAdminDashboard);
router.get('/orders', AdminControl.getOrders);
router.get('/orderDetail/:id',AdminControl.getOrderDetail);
router.post('/orders/:id', AdminControl.updateOrderStatus); // Đảm bảo route này
router.get('/getUsers', AdminControl.getUsers);
router.get('/reports', AdminControl.getReports);
// Route quản lý sản phẩm
router.get('/getProducts', AdminControl.getProducts);
router.get('/getProductDetail/:id', AdminControl.isAdmin, AdminControl.getProductDetail);
router.get('/addProduct', AdminControl.isAdmin, AdminControl.getAddProduct);
router.post('/addProduct', AdminControl.isAdmin, AdminControl.postAddProduct);
router.get('/editProduct/:id', AdminControl.isAdmin, AdminControl.getEditProduct);
router.post('/editProduct/:id', AdminControl.isAdmin, AdminControl.postEditProduct);
router.post('/deleteProduct/:id', AdminControl.isAdmin, AdminControl.deleteProduct);

module.exports = router;
 