const Match = require('../models/Match');

// 发起匹配请求
exports.requestMatch = async (req, res) => {
  try {
    const { receiverId } = req.body;
    if (receiverId === req.user._id.toString())
      return res.status(400).json({ message: "Can't match with yourself" });

    const existing = await Match.findOne({
      $or: [
        { requester: req.user._id, receiver: receiverId },
        { requester: receiverId, receiver: req.user._id },
      ]
    });
    if (existing) return res.status(400).json({ message: 'Match already exists' });

    const match = await Match.create({ requester: req.user._id, receiver: receiverId });

    // Emit real-time notification to receiver via their personal room
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId).emit('match_request', {
        matchId: match._id,
        requesterName: req.user.username,
        message: `${req.user.username} wants to match with you!`,
      });
    }

    res.status(201).json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 接受或拒绝匹配
exports.respondMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (match.receiver.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    match.status = req.body.status; // 'matched' or 'rejected'
    await match.save();
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 获取我的所有匹配
exports.getMyMatches = async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [{ requester: req.user._id }, { receiver: req.user._id }]
    })
      .populate('requester', 'username')
      .populate('receiver', 'username')
      .sort({ createdAt: -1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};