const jwt = require('jsonwebtoken');
const SkillCard = require('../models/SkillCard');
const User = require('../models/User');

// Compute match score between a card owner's skills and the current user's skills.
// +2 per skill: owner offers something I want to learn
// +1 per skill: owner wants something I can teach
function computeMatchScore(ownerOffered = [], ownerWanted = [], myWanted = [], myOffered = []) {
  const normalize = (arr) => arr.map(s => s.toLowerCase());
  const offerSet = new Set(normalize(ownerOffered));
  const wantSet  = new Set(normalize(ownerWanted));
  let score = 0;
  for (const s of normalize(myWanted))  { if (offerSet.has(s)) score += 2; }
  for (const s of normalize(myOffered)) { if (wantSet.has(s))  score += 1; }
  return score;
}

// 获取所有卡片（支持搜索 + 智能排序）
exports.getCards = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { offering: { $regex: search, $options: 'i' } },
          { wanting:  { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ]
      };
    }

    const cards = await SkillCard.find(query)
      .populate('userId', 'username avatar skillsOffered skillsWanted')
      .sort({ createdAt: -1 });

    // Optional: decode current user from Authorization header (no middleware required)
    let myWanted = [];
    let myOffered = [];
    let myId = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const me = await User.findById(decoded.id).select('skillsWanted skillsOffered');
        if (me) {
          myWanted  = me.skillsWanted  || [];
          myOffered = me.skillsOffered || [];
          myId = decoded.id;
        }
      } catch { /* unauthenticated — skip scoring */ }
    }

    const result = cards.map(card => {
      const plain = card.toObject();
      if (myId && card.userId?._id?.toString() !== myId) {
        plain.matchScore = computeMatchScore(
          card.userId?.skillsOffered,
          card.userId?.skillsWanted,
          myWanted,
          myOffered,
        );
      } else {
        plain.matchScore = 0;
      }
      return plain;
    });

    if (myId) {
      result.sort((a, b) => b.matchScore - a.matchScore);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 发布新卡片
exports.createCard = async (req, res) => {
  try {
    const { offering, wanting, description, tags } = req.body;
    const card = await SkillCard.create({
      userId: req.user._id,
      offering, wanting, description, tags
    });
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 删除卡片
exports.deleteCard = async (req, res) => {
  try {
    const card = await SkillCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    if (card.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await card.deleteOne();
    res.json({ message: 'Card deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
