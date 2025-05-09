const COMMON = require('../COMMON');
const OrderItemModels = require("../models/orderItem_models");
const mongoose = require("mongoose");

// Giả sử bạn có các model Product và User để kiểm tra product_id và user_id
const Product = require("../models/product_models"); // Import model Product
const { userModel } = require("../models/user_models"); // Import model User (đúng cách)

