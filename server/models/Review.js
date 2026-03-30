const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000 },
  isAnonymous: { type: Boolean, default: false },
  doctorReply: { type: String, maxlength: 500 },
  doctorRepliedAt: { type: Date },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// One review per patient per doctor
ReviewSchema.index({ patient: 1, doctor: 1 }, { unique: true });

// Update doctor average rating after save
ReviewSchema.post('save', async function () {
  const Doctor = mongoose.model('Doctor');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { doctor: this.doctor } },
    { $group: { _id: '$doctor', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (stats.length > 0) {
    await Doctor.findByIdAndUpdate(this.doctor, {
      averageRating: Math.round(stats[0].avg * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
