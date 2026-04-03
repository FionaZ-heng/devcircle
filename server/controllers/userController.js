const User = require('../models/User');
const Match = require('../models/Match');

// GET /api/users/:id — public profile
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email -role');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const matchCount = await Match.countDocuments({
      $or: [{ requester: user._id }, { receiver: user._id }],
      status: 'matched',
    });

    res.json({ ...user.toObject(), matchCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/me — update own bio and skills
exports.updateMe = async (req, res) => {
  try {
    const { bio, skillsOffered, skillsWanted } = req.body;

    // Use findById + save() so Mongoose explicitly tracks array mutations,
    // which is more reliable than findByIdAndUpdate for array fields.
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.bio = bio || '';
    user.skillsOffered = Array.isArray(skillsOffered) ? skillsOffered : [];
    user.skillsWanted  = Array.isArray(skillsWanted)  ? skillsWanted  : [];
    user.markModified('skillsOffered');
    user.markModified('skillsWanted');
    await user.save();

    const result = user.toObject();
    delete result.password;
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
