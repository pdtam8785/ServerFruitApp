var db = require("./db");
const jwt = require("jsonwebtoken"); 
require("dotenv").config();
const chuoi_ky_tu_bi_mat = process.env.TOKEN_SEC_KEY;
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
var orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "userModel",
      required: true,
    },
    total_amount: {
      type: Number, 
      required: true,
    },
    status: {
     type: Number,
    enum: [0, 1, 2, 3], //
      required: true,
    },
   
    payment_method: {
      type: String,
      enum: ["MoMo", "ZaloPay", "Pay on Delivery"], 
      required: true,
    },
    created_at: {
      type: Date, 
      required: true,
      default: Date.now, 
    },
  },
  { collection: "orders" }
);

// Tạo model từ schema
module.exports = mongoose.model("orders", orderSchema);

// Xuất model để sử dụng ở nơi khác
