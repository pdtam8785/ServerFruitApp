// File upload.js (cấu hình Multer)
const multer = require("multer");
const path = require("path");

const _storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // Ảnh sẽ lưu vào thư mục public/uploads
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`); // Tạo tên file duy nhất
  }
});

const upload = multer({ storage: _storage });
module.exports = upload;