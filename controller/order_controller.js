const COMMON = require('../COMMON');
const OrderItemModels = require("../models/orderItem_models");
const mongoose = require("mongoose");
const orderModel = require('../models/order_models');
// Giả sử bạn có các model Product và User để kiểm tra product_id và user_id
const Product = require("../models/product_models"); // Import model Product
const { userModel } = require("../models/user_models"); // Import model User (đúng cách)

const addOrder = async (req, res) => {
    try {
        const {
            user_id,
            total_amount,
            status,
            delivery_address,
            phone_number,
            payment_method
        } = req.body;

        // 1. Kiểm tra các trường bắt buộc
        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp user_id"
            });
        }
        if (!total_amount || total_amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp total_amount hợp lệ (phải lớn hơn 0)"
            });
        }
        if (!payment_method) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp payment_method"
            });
        }

        // 2. Kiểm tra định dạng user_id
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({
                success: false,
                message: "user_id không hợp lệ"
            });
        }

        // 3. Kiểm tra user_id có tồn tại
        const user = await userModel.findById(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng với user_id này"
            });
        }

        // 4. Lấy thông tin từ userModel nếu không cung cấp
        const finalDeliveryAddress = delivery_address || user.delivery_address;
        const finalPhoneNumber = phone_number || user.phone_number;

        if (!finalDeliveryAddress) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp địa chỉ giao hàng"
            });
        }
        if (!finalPhoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp số điện thoại"
            });
        }

        // 5. Kiểm tra payment_method hợp lệ
        const validPaymentMethods = ["MoMo", "ZaloPay", "Pay on Delivery"];
        if (!validPaymentMethods.includes(payment_method)) {
            return res.status(400).json({
                success: false,
                message: "payment_method không hợp lệ, phải là một trong: " + validPaymentMethods.join(", ")
            });
        }

        // 6. Ánh xạ và kiểm tra status
        const statusMap = {
            "Confirmed": 0,
            "Shipping": 1,
            "Delivered": 2,
            "Cancelled": 3
        };
        let numericStatus = status !== undefined ? status : 0; // Mặc định Confirmed (0)
        if (typeof numericStatus === "string") {
            numericStatus = statusMap[numericStatus];
            if (numericStatus === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "status không hợp lệ, phải là một trong: Confirmed, Shipping, Delivered, Cancelled"
                });
            }
        } else if (typeof numericStatus === "number" && ![0, 1, 2, 3].includes(numericStatus)) {
            return res.status(400).json({
                success: false,
                message: "status phải là một trong các giá trị: 0, 1, 2, 3"
            });
        }

        // 7. Tạo Order mới
        const newOrder = new orderModel({
            user_id,
            total_amount,
            status: numericStatus,
            delivery_address: finalDeliveryAddress,
            phone_number: finalPhoneNumber,
            payment_method,
            created_at: new Date()
        });

        // 8. Lưu Order
        const savedOrder = await newOrder.save();

        return res.status(201).json({
            success: true,
            message: "Tạo Order thành công",
            data: savedOrder
        });

    } catch (error) {
        console.error("Lỗi trong addOrder:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
};
const getUserInfo = async (req, res) => {
    try {
        const { user_id } = req.params;
        const user = await userModel.findById(user_id, "delivery_address phone_number");
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }
        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateUserInfo = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { delivery_address, phone_number } = req.body;

        // Kiểm tra user_id hợp lệ
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({
                success: false,
                message: "user_id không hợp lệ"
            });
        }

        // Kiểm tra các trường bắt buộc
        if (!delivery_address || !phone_number) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp đầy đủ địa chỉ giao hàng và số điện thoại"
            });
        }

        // Tìm và cập nhật thông tin người dùng
        const user = await userModel.findByIdAndUpdate(
            user_id,
            { delivery_address, phone_number },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật thông tin người dùng thành công"
        });
    } catch (error) {
        console.error("Lỗi trong updateUserInfo:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
};

const getOrders = async (req, res) => {
    try {
        const { user_id } = req.params; // Lấy user_id từ path parameter

        // Kiểm tra user_id hợp lệ
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({
                success: false,
                message: "user_id không hợp lệ"
            });
        }

        // Lọc đơn hàng theo user_id và populate thông tin user
        const orders = await orderModel
            .find({ user_id: new mongoose.Types.ObjectId(user_id) })
            .populate("user_id", "delivery_address phone_number") // Lấy chỉ delivery_address và phone_number từ user
            .lean() // Chuyển đổi thành plain object để dễ thao tác
            .exec();

        // Ánh xạ lại dữ liệu để bao gồm delivery_address và phone_number từ user
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            user_id: order.user_id._id.toString(), // Lấy _id của user dưới dạng chuỗi
            total_amount: order.total_amount,
            status: order.status,
            delivery_address: order.user_id.delivery_address || "Chưa có địa chỉ", // Lấy từ user
            phone_number: order.user_id.phone_number || "Chưa có số điện thoại", // Lấy từ user
            payment_method: order.payment_method,
            created_at: order.created_at,
            __v: order.__v
        }));

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đơn hàng thành công",
            data: formattedOrders
        });
    } catch (error) {
        console.error("Lỗi trong getOrders:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
};
module.exports = { addOrder ,getUserInfo,updateUserInfo,getOrders};