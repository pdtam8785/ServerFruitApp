// var { userModel } = require("../models/user_models");
// var bcrypt = require("bcrypt");
// const COMMON = require("../COMMON");
// console.log("API Router loaded");
// const db = require("../models/db");
// const mongoose  = require('mongoose')
// const jwt = require("jsonwebtoken"); 
// require("dotenv").config();
// const chuoi_ky_tu_bi_mat = process.env.TOKEN_SEC_KEY;

// exports.checkExistedUser = async(req,res,next)=>{
//   await db.mongoose.connect(COMMON.uri);
//   try {
//     const { email } = req.params;
//     const userIsExisted = await userModel.findOne({ email }); 
//     if (userIsExisted) {
//       return res.status(200).json({ exists: true });
//     } else {
//       return res.status(200).json({ exists: false });
//     }
//   } catch (error) {
//     console.error('Error checking email existence:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }


// exports.doLogin = async (req, res, next) => {
//   await db.mongoose.connect(COMMON.uri);
//   try {
//     const user = await userModel.findByCredentials(
//       req.body.email,
//       req.body.password
//     ); // Use userModel
//     if (!user) {
//       return res.status(401).json({ error: "Sai thông tin đăng nhập" });
//     }
//     // Đăng nhập thành công, tạo token làm việc mới
//     const token = await user.generateAuthToken(); // Use user object
//     return res.status(200).send({ user: user, token }); // Use user object
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({
//       status: 400,
//       messenger: "Internal Server Error",
//     });
//   }
// };



// exports.doReg = async (req, res, next) => {
//   await db.mongoose.connect(COMMON.uri);
//   try {
//     const salt = await bcrypt.genSalt(10);
//     const user = new userModel(req.body); 

//     user.password = await bcrypt.hash(req.body.password, salt); 
//     const token = await user.generateAuthToken(); 

//     const newUser = await user.save();

//     return res.status(201).send({ user: newUser, token });
//   } catch (error) {
//     console.error('Lỗi khi đăng nhập hoặc đăng ký:', error);
//     return res.status(400).json({
//       status: 400,
//       messenger: error.message || "Lỗi server nội bộ",
//     });
//   }
  
// };
// exports.addUser = async (req, res, next) => {
//   await db.mongoose.connect(COMMON.uri);
//   try {
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(req.body.matKhau, salt); 
//     const newUser = new userModel({
//       first_name: req.body.first_name,
//       email: req.body.email,
//       phone_number: req.body.phone_number,
//       password: hashedPassword,
//       created_at: req.body.created_at,
      
     
//     });
//     const savedUser = await newUser.save();

//     if (savedUser) {
//       const token = jwt.sign(
//         { _id: savedUser._id, username: savedUser.email },
//         chuoi_ky_tu_bi_mat
//       );
//       return res.status(201).json({ user: savedUser, token });
//     } else {
//       return res.status(400).json({
//         status: 400,
//         messenger: "Lỗi, thêm không thành công",
//         data: [],
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       status: 500,
//       messenger: "Internal Server Error",
//       data: [],
//     });
//   }
// };
const { userModel } = require("../models/user_models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const chuoi_ky_tu_bi_mat = process.env.TOKEN_SEC_KEY;
const { verifiedEmail, forgotEmail } = require("../email");

exports.checkExistedUser = async (req, res, next) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ error: "Email không được để trống" });
    }

    const userIsExisted = await userModel.findOne({ email });
    return res.status(200).json({ exists: !!userIsExisted });
  } catch (error) {
    console.error("Error checking email existence:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, token } = req.query;

    if (!email || !token) {
      return res.status(400).json({ error: "Email và token không được để trống" });
    }

    const user = await userModel.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      token,
    });

    if (!user) {
      return res.status(404).json({ error: "Email hoặc token không hợp lệ" });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "Tài khoản đã được xác nhận trước đó" });
    }

    user.isVerified = true;
    await user.save();

    return res.status(200).json({ message: "Xác nhận tài khoản thành công, bạn có thể đăng nhập" });
  } catch (error) {
    console.error("Lỗi khi xác nhận email:", error);
    return res.status(500).json({
      status: 500,
      message: "Lỗi server nội bộ: " + error.message,
    });
  }
};

exports.doLogin = async (req, res, next) => {
  try {
    const { email, password, forgotPassword } = req.body;
    console.log("Email:", email);
    console.log("Password:", password);
    if (!email || (!password && !forgotPassword)) {
      return res.status(400).json({ error: "Email và mật khẩu không được để trống" });
    }

    if (forgotPassword) {
      const user = await userModel.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
      });
      if (!user) {
        return res.status(404).json({ error: "Email không tồn tại" });
      }

      if (user.role === "baned") {
        return res.status(403).json({ error: "Tài khoản của bạn đã bị khóa" });
      }
    

      const randomNumber = Math.floor(100000 + Math.random() * 900000).toString();
      user.resetCode = randomNumber;
      user.resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      const emailResult = await forgotEmail(email, randomNumber);
      if (!emailResult.success) {
        return res.status(500).json({ error: emailResult.message });
      }

      return res.status(200).json({ message: "Mã xác nhận đã được gửi đến email của bạn" });
    }

    const user = await userModel.findByCredentials(email, password);
    if (!user) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Tài khoản chưa được xác nhận. Vui lòng kiểm tra email để xác nhận tài khoản.",
      });
    }

    if (user.role === "baned") {
      return res.status(403).json({ error: "Tài khoản của bạn đã bị cấm" });
    }

    const token = await user.generateAuthToken();
    return res.status(200).json({ user: { ...user.toObject(), role: user.role }, token });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: 400,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.doReg = async (req, res, next) => {
  try {
    const { first_name, email, password, phone_number, role } = req.body;
    console.log("first_name:", first_name);
    console.log("email:", email);
    console.log("password:", password);
    console.log("phone_number:", phone_number);
    console.log("role:", role);
    if (!first_name || !email || !password || !phone_number) {
      return res.status(400).json({ error: "Vui lòng cung cấp đầy đủ thông tin" });
    }

    // Ngăn người dùng tự gán vai trò 'admin' hoặc 'baned'
    if (role && role !== "user") {
      return res.status(403).json({ error: "Không được phép gán vai trò này" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email đã tồn tại" });
    }

    const salt = await bcrypt.genSalt(10);
    const user = new userModel({
      first_name,
      email,
      password: await bcrypt.hash(password, salt),
      phone_number,
      created_at: new Date(),
      isVerified: false,
      role: "user", // Gán mặc định là 'user'
    });

    const token = await user.generateAuthToken();
    await user.save();

    const verificationLink = `http://localhost:3000/user/verify?email=${email}&token=${token}`;
    const emailResult = await verifiedEmail(email, verificationLink);
    if (!emailResult.success) {
      return res.status(500).json({ error: emailResult.message });
    }

    return res.status(201).json({
      user: { ...user.toObject(), role: user.role },
      token,
      message: "Đăng ký thành công, vui lòng kiểm tra email để xác nhận",
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    return res.status(400).json({
      status: 400,
      message: error.message || "Lỗi server nội bộ",
    });
  }
};

exports.addUser = async (req, res, next) => {
  try {
    const { first_name, email, password, phone_number, role } = req.body;
    console.log("First Name:", first_name);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Phone Number:", phone_number);
    console.log("Role:", role);

    if (!first_name || !email || !password || !phone_number) {
      return res.status(400).json({ error: "Vui lòng cung cấp đầy đủ thông tin" });
    }

    // Kiểm tra quyền admin (nếu cần)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Không có token xác thực" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, chuoi_ky_tu_bi_mat);
    const currentUser = await userModel.findById(decoded._id);
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ error: "Chỉ admin mới có thể thêm người dùng" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email đã tồn tại" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      first_name,
      email,
      password: hashedPassword,
      phone_number,
      created_at: new Date(),
      isVerified: false,
      role: role || "user", // Cho phép admin chỉ định role, mặc định là 'user'
    });

    const savedUser = await newUser.save();
    const newToken = await savedUser.generateAuthToken();

    const verificationLink = `http://localhost:3000/user/verify?email=${email}&token=${newToken}`;
    const emailResult = await verifiedEmail(email, verificationLink);
    if (!emailResult.success) {
      return res.status(500).json({ error: emailResult.message });
    }

    return res.status(201).json({
      user: { ...savedUser.toObject(), role: savedUser.role },
      token: newToken,
      message: "Thêm user thành công, vui lòng kiểm tra email để xác nhận",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      data: [],
    });
  }
};

exports.verifyResetCode = async (req, res) => {
  try {
      const { email, resetCode } = req.body;
      if (!email || !resetCode) {
          return res.status(400).json({ error: "Email và mã xác nhận không được để trống" });
      }

      const user = await userModel.findOne({
          email: { $regex: new RegExp(`^${email}$`, "i") },
          resetCode,
          resetCodeExpiry: { $gt: new Date() }, // Kiểm tra mã còn hiệu lực
      });

      if (!user) {
          return res.status(400).json({ error: "Mã xác nhận không hợp lệ hoặc đã hết hạn" });
      }

      return res.status(200).json({ message: "Mã xác nhận hợp lệ" });
  } catch (error) {
      console.error("Lỗi khi xác minh mã:", error);
      return res.status(500).json({ error: "Lỗi server nội bộ: " + error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
      const { email, resetCode, newPassword } = req.body;
      if (!email || !resetCode || !newPassword) {
          return res.status(400).json({ error: "Email, mã xác nhận và mật khẩu mới không được để trống" });
      }

      const user = await userModel.findOne({
          email: { $regex: new RegExp(`^${email}$`, "i") },
          resetCode,
          resetCodeExpiry: { $gt: new Date() },
      });

      if (!user) {
          return res.status(400).json({ error: "Mã xác nhận không hợp lệ hoặc đã hết hạn" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.resetCode = null; // Xóa mã xác nhận
      user.resetCodeExpiry = null;
      await user.save();

      return res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      return res.status(500).json({ error: "Lỗi server nội bộ: " + error.message });
  }
};