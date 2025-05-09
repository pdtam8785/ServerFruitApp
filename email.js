const nodemailer = require("nodemailer");
require("dotenv").config();

// Khởi tạo transporter với tài khoản Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "tamp8785@gmail.com",
    pass: process.env.EMAIL_PASS || "uweq rshg pppa nmen", // Thay bằng App Password của bạn
  },
});

/**
 * Hàm gửi email xác nhận tài khoản
 * @param {string} email - Địa chỉ email người nhận
 * @param {string} link - Liên kết xác nhận
 * @returns {Promise<{ success: boolean, message: string }>}
 */
const verifiedEmail = async (email, link) => {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: "Email không hợp lệ" };
    }
    if (!link) {
      return { success: false, message: "Liên kết xác nhận không được để trống" };
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER || "tamp8785@gmail.com",
      to: email,
      subject: "Xác nhận tài khoản",
      html: `<h2>Chào mừng bạn đến với Fruit Hub</h2>
             <p>Nhấn vào đây để xác nhận tài khoản của bạn</p>
             <a href="${link}">Xác nhận</a>`,
    });

    return { success: true, message: "Email xác nhận đã được gửi thành công" };
  } catch (error) {
    return { success: false, message: `Gửi email xác nhận thất bại: ${error.message}` };
  }
};

/**
 * Hàm gửi email đặt lại mật khẩu
 * @param {string} email - Địa chỉ email người nhận
 * @param {string} randomNumber - Mã xác nhận
 * @returns {Promise<{ success: boolean, message: string }>}
 */
const forgotEmail = async (email, randomNumber) => {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: "Email không hợp lệ" };
    }
    if (!randomNumber) {
      return { success: false, message: "Mã xác nhận không được để trống" };
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER || "tamp8785@gmail.com",
      to: email,
      subject: "Yêu cầu đặt lại mật khẩu",
      html: `<p>Mã xác nhận của bạn là: <strong>${randomNumber}</strong></p>
             <p>Vui lòng nhập mã xác nhận để tiếp tục đặt lại mật khẩu.</p>`,
    });

    return { success: true, message: "Email đặt lại mật khẩu đã được gửi thành công" };
  } catch (error) {
    return { success: false, message: `Gửi email đặt lại mật khẩu thất bại: ${error.message}` };
  }
};

module.exports = { verifiedEmail, forgotEmail };