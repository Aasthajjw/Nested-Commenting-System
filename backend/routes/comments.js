const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Comment = require('../models/Comment');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get comments for a post with nested replies
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).populate({
    path: 'user',
    select: 'name avatar',
    match: { _id: { $exists: true } } // ignore invalid ObjectIds
  }).lean();

    // Build nested comment tree
    const map = {};
    const roots = [];
    comments.forEach(c => {
      c.replies = [];
      map[c._id] = c;
    });
    comments.forEach(c => {
      if (c.parent) {
        if (map[c.parent]) map[c.parent].replies.push(c);
      } else {
        roots.push(c);
      }
    });

    res.json(roots);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Add comment or reply
router.post('/:postId', auth, async (req, res) => {
  try {
    const { text, parentId } = req.body;
    const comment = new Comment({
      text,
      user: req.user._id,
      parent: parentId || null,
      postId: req.params.postId,
    });
    await comment.save();
    await comment.populate('user', 'name avatar');
    res.json(comment);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Upvote comment
router.post('/upvote/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    comment.upvotes++;
    await comment.save();
    res.json({ upvotes: comment.upvotes });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete comment (admin or owner)
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.user._id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.remove();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;