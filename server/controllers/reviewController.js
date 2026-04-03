const Review = require('../models/Review');
const Match = require('../models/Match');

// POST /api/reviews
exports.submitReview = async (req, res) => {
  try {
    const { revieweeId, matchId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const match = await Match.findById(matchId);
    if (!match || match.status !== 'matched')
      return res.status(400).json({ message: 'Match not found or not completed' });

    const isParticipant =
      match.requester.toString() === req.user._id.toString() ||
      match.receiver.toString() === req.user._id.toString();
    if (!isParticipant)
      return res.status(403).json({ message: 'Not authorized' });

    if (req.user._id.toString() === revieweeId)
      return res.status(400).json({ message: "Can't review yourself" });

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      matchId,
      rating,
      comment,
    });
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'You have already reviewed this match' });
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/given — reviews submitted by current user (matchIds only)
exports.getGivenReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id }).select('matchId');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/:userId — all reviews received by a user
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
