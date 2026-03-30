const User = require('../models/User');

/**
 * Add notification to a user
 * @param {String} userId - User ID
 * @param {Object} notification - { message, type, data }
 */
const addNotification = async (userId, notification) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $push: {
        notifications: {
          $each: [{ ...notification, isRead: false, createdAt: new Date() }],
          $position: 0,
          $slice: 100, // Keep only last 100 notifications
        }
      }
    });
    console.log(`📢 إشعار للمستخدم ${userId}: ${notification.message}`);
  } catch (err) {
    console.error('خطأ في إرسال الإشعار:', err.message);
  }
};

module.exports = { addNotification };
