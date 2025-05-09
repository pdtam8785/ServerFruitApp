var db = require("./db");
const jwt = require("jsonwebtoken"); 
require("dotenv").config();
const chuoi_ky_tu_bi_mat = process.env.TOKEN_SEC_KEY;
const bcrypt = require("bcrypt");

var orderSchema = new db.mongoose.Schema(
  {
    user_id: {
      type: db.mongoose.Schema.Types.ObjectId, 
      ref: "userModel",
      required: true,
    },
    total_amount: {
      type: Number, 
      required: true,
    },
    status: {
      type: String,
     enum: ["Confirmed", "Shipping", "Delivered", "Cancelled"], //
      required: true,
      default: "Confirmed",
    },
    delivery_address: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String, 
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
let orderModel = db.mongoose.model("orders", orderSchema);

// Xuất model để sử dụng ở nơi khác
module.exports = { orderModel };