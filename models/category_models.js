var db = require("./db");
const jwt = require("jsonwebtoken"); 
require("dotenv").config();
const chuoi_ky_tu_bi_mat = process.env.TOKEN_SEC_KEY;
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
var CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { collection: "categorys" }
);

// Tạo model từ schema
module.exports = mongoose.model("categorys", CategorySchema);
