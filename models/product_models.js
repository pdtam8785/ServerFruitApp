var db = require("./db");
const jwt = require("jsonwebtoken"); 
require("dotenv").config();
const chuoi_ky_tu_bi_mat = process.env.TOKEN_SEC_KEY;
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true},
  image_url: { type: Array, required: true },
  category_id: {  type: mongoose.Schema.Types.ObjectId, required: true },
}, { collection: "products" });

// Export trực tiếp model
module.exports = mongoose.model("Product", productSchema);

