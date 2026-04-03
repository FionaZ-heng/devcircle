const mongoose = require('mongoose');

const skillCardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offering: { type: String, required: true },
  wanting: { type: String, required: true },
  description: { type: String, default: '' },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('SkillCard', skillCardSchema);