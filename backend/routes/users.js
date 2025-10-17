const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get current logged-in user info
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// (Optional) Get all users - admin only
router.get('/', auth, async (req, res) => {
  try {
    // Only admin can list all users
    const requester = await User.findById(req.user._id);
    if (!requester?.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;