const express = require('express');
const router = express.Router();
const { cloudinary, upload } = require('../config/cloudinary');
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'devcircle-avatars',
          transformation: [{ width: 200, height: 200, crop: 'fill' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    res.json({ avatar: user.avatar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;