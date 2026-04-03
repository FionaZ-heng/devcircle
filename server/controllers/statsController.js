const Match = require('../models/Match');
const SkillCard = require('../models/SkillCard');
const Message = require('../models/Message');

exports.getMyStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 我的匹配数量
    const totalMatches = await Match.countDocuments({
      $or: [{ requester: userId }, { receiver: userId }],
      status: 'matched'
    });

    // 我发布的卡片数
    const totalCards = await SkillCard.countDocuments({ userId });

    // 我发的消息数
    const totalMessages = await Message.countDocuments({ sender: userId });

    // 最近7天每天的消息数量
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const dailyMessages = await Message.aggregate([
      { $match: { sender: userId, createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%m/%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // 热门技能标签
    const cards = await SkillCard.find();
   const tagCount = {};
    cards.forEach(card => {
      card.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    const trendingTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    res.json({ totalMatches, totalCards, totalMessages, dailyMessages, trendingTags });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};