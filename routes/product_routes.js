var express = require("express");
var router = express.Router();
const upload = require("../upload");
const ProductControl = require("../controller/product_controller");
router.get('/getProduct', ProductControl.getListProduct);
router.post('/addProduct', upload.fields([{ name: 'image_url' }]), ProductControl.addProduct);
 router.get('/getProductDetail/:id',ProductControl.getProductDetail);
// router.post("/addUser", apiCtrl.addUser)
module.exports = router;
