const jwt = require('jsonwebtoken');
const SkillCard = require('../models/SkillCard');
const User = require('../models/User');

// Compute match score using profile skills AND card content.
// Uses substring matching on free-text fields so "React.js", "React development"
// all match a skill term of "React".
// +2 per term: owner can teach something I want to learn
// +1 per term: owner wants to learn something I can teach
function computeMatchScore(card, myWanted = [], myOffered = []) {
  if (!myWanted.length && !myOffered.length) return 0;

  const norm = s => s.toLowerCase().trim();

  // Exact-match sets for structured fields (profile skills, tags)
  const ownerOfferedExact = new Set((card.userId?.skillsOffered || []).map(norm));
  const ownerTagsExact    = new Set((card.tags || []).map(norm));
  const ownerWantedExact  = new Set((card.userId?.skillsWanted || []).map(norm));

  // Full lowercased text for substring matching
  const offeringText = norm(card.offering || '');
  const wantingText  = norm(card.wanting  || '');

  let score = 0;
  for (const skill of myWanted.map(norm)) {
    if (
      ownerOfferedExact.has(skill) ||   // profile skill exact match
      ownerTagsExact.has(skill)    ||   // card tag exact match
      offeringText.includes(skill)      // offering text substring match
    ) score += 2;
  }
  for (const skill of myOffered.map(norm)) {
    if (
      ownerWantedExact.has(skill) ||    // profile skill exact match
      wantingText.includes(skill)       // wanting text substring match
    ) score += 1;
  }
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

          // Fallback: if profile skills not set, derive keywords from the user's own cards
          if (!myWanted.length && !myOffered.length) {
            const myCards = await SkillCard.find({ userId: decoded.id });
            myOffered = [...new Set(myCards.flatMap(c => c.tags || []))];
            myWanted  = myCards.map(c => c.wanting).filter(Boolean);
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
