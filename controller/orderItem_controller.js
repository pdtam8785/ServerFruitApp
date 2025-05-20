const COMMON = require('../COMMON');
const OrderItemModels = require("../models/orderItem_models");
const mongoose = require("mongoose");

// Giả sử bạn có các model Product và User để kiểm tra product_id và user_id
const Product = require("../models/product_models"); // Import model Product
const { userModel } = require("../models/user_models"); // Import model User (đúng cách)

const addOrderItem = async (req, res) => {
    try {
        const { user_id, quantity, price, product_id } = req.body;
        console.log(userModel); // Kiểm tra xem userModel có được import đúng không
        console.log(Product); // Kiểm tra Product
        console.log("Request body:", req.body);

        // Kiểm tra dữ liệu đầu vào
        if (!user_id || !quantity || !price || !product_id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp đầy đủ user_id, quantity, price và product_id",
            });
        }

        // Kiểm tra ObjectId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({
                success: false,
                message: "user_id không hợp lệ"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(product_id)) {
            return res.status(400).json({
                success: false,
                message: "product_id không hợp lệ"
            });
        }

        // Kiểm tra người dùng và sản phẩm tồn tại
        const [userExists, productExists] = await Promise.all([
            userModel.findById(user_id), // Thay User bằng userModel
            Product.findById(product_id)
        ]);

        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: "Người dùng không tồn tại",
            });
        }

        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: "Sản phẩm không tồn tại",
            });
        }

        // Kiểm tra số lượng hợp lệ
        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Số lượng phải lớn hơn 0"
            });
        }

        // Tạo OrderItem mới
        const newOrderItem = new OrderItemModels({
            user_id: new mongoose.Types.ObjectId(user_id),
            quantity,
            price,
            product_id: new mongoose.Types.ObjectId(product_id),
        });

        // Lưu vào cơ sở dữ liệu
        const savedOrderItem = await newOrderItem.save();

        return res.status(201).json({
            success: true,
            message: "Thêm OrderItem thành công",
            data: savedOrderItem,
        });
    } catch (error) {
        console.error("Lỗi trong addOrderItem:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server: " + error.message,
        });
    }
};


// Hàm lấy danh sách OrderItem
// Hàm lấy danh sách OrderItem theo user_id
const getOrderItems = async (req, res) => {
   try {
           const { user_id } = req.params;
           
           const orderItems = await OrderItemModels.find({ user_id })
               .populate({
                   path: "product_id",
                   select: "name price image_url quantity",
                   model: "Product" // Đảm bảo model name chính xác
               })
               .populate("user_id", "email")
               .lean() // Chuyển sang plain object
               .exec();
   
           if (!orderItems?.length) {
               return res.status(404).json({
                   success: false,
                   message: `Không tìm thấy OrderItem nào cho user ${user_id}`,
               });
           }
   
           // Format lại response để phù hợp với Android
           const formattedItems = orderItems.map(item => ({
               ...item,
               product_Order: item.product_id, // Copy thông tin product sang product_Order
               product_id: item.product_id?._id // Giữ lại product_id dạng string
           }));
   
           res.status(200).json({
               success: true,
               data: formattedItems
           });
       }  catch (error) {
           return res.status(500).json({
               success: false,
               message: "Lỗi server: " + error.message,
           });
       }
   };
   const deleteOrderItem = async (req, res) => {
    try {
        const { orderitem_id } = req.params;

        // Kiểm tra orderItem_id có được cung cấp không
        if (!orderitem_id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp orderItem_id"
            });
        }

        // Kiểm tra ObjectId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(orderitem_id)) {
            return res.status(400).json({
                success: false,
                message: "orderItem_id không hợp lệ"
            });
        }

        // Tìm và xóa OrderItem
        const deletedItem = await OrderItemModels.findByIdAndDelete(orderitem_id);

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy OrderItem để xóa"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Xóa OrderItem thành công",
            data: deletedItem
        });

    } catch (error) {
        console.error("Lỗi trong deleteOrderItem:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
};

 
   // Export các hàm để sử dụng trong route
   module.exports = { addOrderItem, getOrderItems,deleteOrderItem };