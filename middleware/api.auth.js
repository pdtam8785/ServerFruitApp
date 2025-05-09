// const jwt = require('jsonwebtoken')
// const {UserModel} = require('../models/user_models');
// require('dotenv').config(); // su dung thu vien doc file env
// const chuoi_ky_tu_bi_mat = process.env.TOKEN_SEC_KEY;


// const api_auth = async(req, res, next) => {
//    let header_token = req.header('Authorization');


//    if(typeof(header_token) =='undefined'){
//        return res.status(403).json({msg: 'Không xác định token'});
//    }


//    const token = header_token.replace('Bearer ', '')


  
//    try {
//        const data = jwt.verify(token, chuoi_ky_tu_bi_mat)
//        console.log(data);
//        const user = await UserModel.findOne({ _id: data._id, token: token })
//        // cách khác: decode token ra sau đó tìm trong csdl có tồn tại user theo thông tin trong token hay không


// if (!user) {
//            throw new Error("Không xác định được người dùng")
//        }
//        req.user = user
//        req.token = token
//        next()
//    } catch (error) {
//        console.log(error);
//        res.status(401).send({ error: error.message })
//    }


// }
// module.exports = {api_auth}
const jwt = require("jsonwebtoken");
const { userModel } = require("../models/user_models");
require("dotenv").config();
const chuoi_ky_tu_bi_mat = process.env.TOKEN_SEC_KEY;

const api_auth = async (req, res, next) => {
  let header_token = req.header("Authorization");

  if (!header_token) {
    return res.status(403).json({ message: "Không xác định token" });
  }

  const token = header_token.replace("Bearer ", "");

  try {
    const data = jwt.verify(token, chuoi_ky_tu_bi_mat);
    const user = await userModel.findOne({ _id: data._id, token: token });

    if (!user) {
      return res.status(401).json({ message: "Không xác định được người dùng" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: error.message || "Token không hợp lệ" });
  }
};

module.exports = { api_auth };