import React, { useEffect, useState } from 'react';
import api from '../api';
import Comment from './Comment';
import useAuth from '../hooks/useAuth';

export default function CommentList({ postId }) {
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState('newest'); // newest, upvotes, replies

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${postId}`);
      setComments(res.data);
    } catch {
      alert('Failed to fetch comments');
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // Flatten comments to count replies for sorting
  const countReplies = (comment) => {
    if (!comment.replies) return 0;
    let count = comment.replies.length;
    comment.replies.forEach(r => {
      count += countReplies(r);
    });
    return count;
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'upvotes') return b.upvotes - a.upvotes;
    if (sortBy === 'replies') return countReplies(b) - countReplies(a);
    // newest by default
    const dateA = new Date(a.createdAt || a.created_at);
    const dateB = new Date(b.createdAt || b.created_at);
    return dateB - dateA;
  });

  const handleNewCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
      await api.post(`/comments/${postId}`, { text: newCommentText, user: user.id});
      setNewCommentText('');
      fetchComments();
    } catch {
      alert('Failed to post comment');
    }
  };

  return (
    <div style={{ maxWidth: '90%', margin: '20px auto' }}>
      <h3>Comments</h3>

      <div style={{ marginBottom: 10 }}>
        <label>Sort by: </label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="upvotes">Most Upvotes</option>
          <option value="replies">Most Replies</option>
        </select>
      </div>

      {user ? (
        <form onSubmit={handleNewCommentSubmit} style={{ marginBottom: 20 }}>
          <textarea
            value={newCommentText}
            onChange={e => setNewCommentText(e.target.value)}
            rows={3}
            placeholder="Add a comment..."
            required
            style={{ width: '100%' }}
          />
          <button type="submit" style={{ marginTop: 5 }}>
            Post Comment
          </button>
        </form>
      ) : (
        <p>Please login to comment.</p>
      )}

      {sortedComments.length === 0 && <p>No comments yet.</p>}

      {sortedComments.map(comment => (
        <Comment key={comment._id} comment={comment} postId={postId} refreshComments={fetchComments} user={user}/>
      ))}
    </div>
  );
}