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
    console.log('[updateMe] received:', { bio, skillsOffered, skillsWanted });
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { bio: bio || '', skillsOffered: skillsOffered || [], skillsWanted: skillsWanted || [] } },
      { new: true }
    ).select('-password');
    console.log('[updateMe] saved:', { skillsOffered: updated.skillsOffered, skillsWanted: updated.skillsWanted });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
