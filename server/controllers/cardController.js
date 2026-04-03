const jwt = require('jsonwebtoken');
const SkillCard = require('../models/SkillCard');
const User = require('../models/User');

// Tokenize a free-text string into lowercase keywords (≥3 chars).
function tokenize(text = '') {
  return text.toLowerCase().split(/[\s,/+&()\-]+/).filter(w => w.length >= 3);
}

// Compute match score using both profile skills AND card content (tags/text).
// +2 per term: owner can teach something I want to learn
// +1 per term: owner wants to learn something I can teach
function computeMatchScore(card, myWanted = [], myOffered = []) {
  if (!myWanted.length && !myOffered.length) return 0;

  const norm = s => s.toLowerCase().trim();

  // Owner's "offered" signals: profile skills + card tags + card offering keywords
  const offerSet = new Set([
    ...(card.userId?.skillsOffered || []).map(norm),
    ...(card.tags || []).map(norm),
    ...tokenize(card.offering),
  ]);

  // Owner's "wanted" signals: profile skills + card wanting keywords
  const wantSet = new Set([
    ...(card.userId?.skillsWanted || []).map(norm),
    ...tokenize(card.wanting),
  ]);

  let score = 0;
  for (const s of myWanted)  { if (offerSet.has(norm(s))) score += 2; }
  for (const s of myOffered) { if (wantSet.has(norm(s)))  score += 1; }
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

          // Fallback: if profile skills not set, derive from the user's own cards
          if (!myWanted.length && !myOffered.length) {
            const myCards = await SkillCard.find({ userId: decoded.id });
            myOffered = [...new Set(myCards.flatMap(c => [...(c.tags || []), ...tokenize(c.offering)]))];
            myWanted  = [...new Set(myCards.flatMap(c => tokenize(c.wanting)))];
          }
        }
      } catch { /* unauthenticated — skip scoring */ }
    }

    const result = cards.map(card => {
      const plain = card.toObject();
      if (myId && plain.userId?._id?.toString() !== myId) {
        plain.matchScore = computeMatchScore(plain, myWanted, myOffered);
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
