const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  comment:  { type: String, default: '', maxlength: 500 },
}, { timestamps: true });

// One review per reviewer per match
reviewSchema.index({ reviewer: 1, matchId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
