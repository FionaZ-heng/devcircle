const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.file.path },
      { new: true }
    ).select('-password');
    res.json({ avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;