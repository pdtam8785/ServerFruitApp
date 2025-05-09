var express = require("express");
var router = express.Router();
const upload = require("../upload");
const apiCtrl = require("../controller/user_controller");
router.post('/login', apiCtrl.doLogin);
router.post('/reg', apiCtrl.doReg);
router.get('/checkExistedUser/:email',apiCtrl.checkExistedUser);
router.post("/addUser", apiCtrl.addUser)
router.get("/verify", apiCtrl.verifyEmail); 
router.post("/user/verify-reset-code", apiCtrl.verifyResetCode);
router.post("/user/reset-password", apiCtrl.resetPassword);
module.exports = router;
