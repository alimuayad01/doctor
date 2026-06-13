const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsRoot = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');
const uploadPath = (folder) => path.join(uploadsRoot, folder);

// Create upload dirs if they don't exist
const dirs = ['avatars', 'credentials', 'institutions', 'labs', 'misc', 'cases'].map(uploadPath);
dirs.forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'misc';
    if (file.fieldname === 'avatar') folder = 'avatars';
    else if (file.fieldname === 'credential') folder = 'credentials';
    else if (file.fieldname === 'institution') folder = 'institutions';
    else if (file.fieldname === 'lab') folder = 'labs';
    cb(null, uploadPath(folder));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('نوع الملف غير مسموح به (JPG, PNG, PDF فقط)'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

module.exports = upload;
