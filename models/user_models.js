// var db = require("./db");
// const jwt = require("jsonwebtoken"); 
// require("dotenv").config();
// const chuoi_ky_tu_bi_mat = process.env.TOKEN_SEC_KEY;
// const bcrypt = require("bcrypt");

// var userSchema = new db.mongoose.Schema(
//   {
//     first_name: { type: String, required: true },
//     email: { type: String, required: true },
//     password: { type: String, required: true },
//     phone_number: { type: String, required: true },
//     created_at: { type: String, required: true , default: Date.now},
//     token: {
//       type: String,
//       required: false,
//     },
//   },
//   { collection: "users" }
// );

// /**
//  * Hàm tạo token để đăng nhập với API
//  * @returns {Promise<*>}
//  */
// userSchema.methods.generateAuthToken = async function () {
//   const user = this;
//   console.log(user);
//   const token = jwt.sign(
//     { _id: user._id, email: user.email },
//     chuoi_ky_tu_bi_mat
//   );
//   // user.tokens = user.tokens.concat({token}) // code này dành cho nhiều token, ở demo này dùng 1 token
//   user.token = token;
//   await user.save();
//   return token;
// };

// /**
//  * Hàm tìm kiếm user theo tài khoản
//  * @param email
//  * @param password
//  * @returns {Promise<*>}
//  */
// userSchema.statics.findByCredentials = async (email, password) => {
//   const user = await userModel.findOne({ email  });
//   if (!user) {
//     throw new Error("Không tồn tại user");
//   }
//   const isPasswordMatch = await bcrypt.compare(password, user.password);
//   if (!isPasswordMatch) {
//     throw new Error("Sai password");
//   }
//   return user;
// };
// let userModel = db.mongoose.model("userModel", userSchema);
// module.exports = { userModel };
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const chuoi_ky_tu_bi_mat = process.env.TOKEN_SEC_KEY;

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone_number: { type: String, required: true },
    created_at: { type: Date, required: true, default: Date.now },
    token: { type: String, required: false },
    delivery_address: {
      type: String,
      required: true,
    },
    resetCode: { type: String, required: false },
    resetCodeExpiry: { type: Date, required: false },
    isVerified: { type: Boolean, required: true, default: false },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "baned"], // Các vai trò hợp lệ
      default: "user", // Vai trò mặc định là 'user'
    },
  },
  { collection: "users" }
);

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id, email: user.email, role: user.role }, // Thêm role vào payload của token
    chuoi_ky_tu_bi_mat,
    { expiresIn: "7d" } // Tùy chọn: thêm thời gian hết hạn cho token (ví dụ: 7 ngày)
  );
  user.token = token;
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  if (!email || !password) return null;

  const user = await userModel.findOne({
    email: { $regex: new RegExp(`^${email}$`, "i") },
  });
  if (!user) return null;

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) return null;

  return user;
};

const userModel = mongoose.model("userModel", userSchema);
module.exports = { userModel };