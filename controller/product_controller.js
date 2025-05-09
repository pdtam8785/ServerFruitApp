const COMMON = require('../COMMON')
const ProductModels = require("../models/product_models");
const mongoose = require("mongoose");
// exports.getListProduct = async (req, res, next) => {
//   try {
//     await mongoose.connect(COMMON.uri);
//     const product = await ProductModels.find();
//     console.log(product);

//     res.status(200).json(product);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Lỗi khi lấy danh sách sản phẩm" });
//   }
// };
// Thêm sản phẩm mới (POST)
exports.addProduct = async (req, res) => {
  try {
   
    const { name, price, description, category_id ,quantity } = req.body;
  
    const image_urls = req.files['image_url']
    ? req.files['image_url'].map(file => 
        `/uploads/${file.filename}` // Chỉ lấy filename, không dùng file.path
      )
    : [];
    const newProduct = new ProductModels({
      name,
      price: parseFloat(price),
      description: description || "",
      image_url: image_urls, // Lưu mảng đường dẫn file
      category_id,
      quantity: parseInt(quantity) || 0
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ data: savedProduct });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Lỗi khi thêm sản phẩm" });
  }
};


exports.getListProduct = async (req, res, next) => {
  try {
    await mongoose.connect(COMMON.uri);

    const { category_id } = req.query; // Lấy category_id từ query parameter
    const filter = category_id ? { category_id: new mongoose.Types.ObjectId(category_id) } : {};

    const products = await ProductModels.find(filter);
    console.log(products);

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách sản phẩm" });
  }
};
// API lấy chi tiết sản phẩm theo ID (GET)
exports.getProductDetail = async (req, res) => {
  try {
    await mongoose.connect(COMMON.uri);
    
    const { id } = req.params; // Lấy ID từ route parameter
    
    // Kiểm tra ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID sản phẩm không hợp lệ" });
    }

    // Tìm sản phẩm theo ID
    const product = await ProductModels.findById(id);
    
    if (!product) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy chi tiết sản phẩm" });
  }
};