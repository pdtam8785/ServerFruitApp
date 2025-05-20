var express = require("express");
var router = express.Router();
const upload = require("../upload");
const OrderItemControl = require("../controller/orderItem_controller");
router.post('/addOrderItem', OrderItemControl.addOrderItem);
//router.post('/addProduct', upload.fields([{ name: 'image_url' }]), ProductControl.addProduct);
 router.get('/getOrderItems/:user_id',OrderItemControl.getOrderItems);
 router.delete('/deleteOrderItems/:orderitem_id',OrderItemControl.deleteOrderItem);
module.exports = router;
