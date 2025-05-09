var db = require("./db");
const jwt = require("jsonwebtoken"); 
require("dotenv").config();
const chuoi_ky_tu_bi_mat = process.env.TOKEN_SEC_KEY;
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    user_id: {  
        type: mongoose.Schema.Types.ObjectId, required: true},
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        product_id: {  
            type: mongoose.Schema.Types.ObjectId, required: true},
 }, { collection: "orderitems" });

// Export trực tiếp model
module.exports = mongoose.model("orderItem", orderItemSchema);

