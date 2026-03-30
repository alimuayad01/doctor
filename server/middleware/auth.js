const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ success: false, message: 'المستخدم غير موجود' });
    if (!req.user.isActive) return res.status(403).json({ success: false, message: 'الحساب موقوف' });
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'رمز التحقق غير صالح' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `صلاحية (${req.user.role}) غير مسموح لها بهذا الإجراء` });
  }
  next();
};

module.exports = { protect, authorize };
