const COMMON = require('../COMMON')
const CategoryModels = require("../models/category_models");
const mongoose = require("mongoose");
exports.getListCategory = async (req, res, next) => {
  try {
    await mongoose.connect(COMMON.uri);
    const category = await CategoryModels.find();
    console.log(category);

    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách danh mục" });
  }
};
exports.addCategory = async (req, res, next) => {
  try {
    await mongoose.connect(COMMON.uri);
 
    const { name } = req.body;
   console.log("name:", name);
    // Kiểm tra xem tên danh mục có được cung cấp không
    if (!name) {
      return res.status(400).json({ success: false, message: "Tên danh mục là bắt buộc" });
    }

    // Kiểm tra xem danh mục đã tồn tại chưa
    const existingCategory = await CategoryModels.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: "Danh mục đã tồn tại" });
    }

    // Tạo danh mục mới
    const newCategory = new CategoryModels({ name });
    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Thêm danh mục thành công",
      category: newCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi khi thêm danh mục" });
  }
};