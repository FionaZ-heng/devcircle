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
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { bio, skillsOffered, skillsWanted },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
