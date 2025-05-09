var express = require("express");
var router = express.Router();
const upload = require("../upload");
const CategoryControl = require("../controller/category_controller");
router.get('/getCategory', CategoryControl.getListCategory);
router.post('/addCategory', CategoryControl.addCategory);
// router.get('/check/:email',apiCtrl.checkExistedUser);
// router.post("/addUser", apiCtrl.addUser)
module.exports = router;
