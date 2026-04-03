const SkillCard = require('../models/SkillCard');

// 获取所有卡片（支持搜索）
exports.getCards = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { offering: { $regex: search, $options: 'i' } },
          { wanting: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ]
      };
    }
    const cards = await SkillCard.find(query)
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(cards);
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