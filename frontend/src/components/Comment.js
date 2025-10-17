import React, { useState } from 'react';
import api from '../api';
import useAuth from '../hooks/useAuth';

const getUserInfo = (user) => {
  if (!user) return { id: null, name: 'Unknown', avatar: 'https://i.pravatar.cc/150?u=unknown' };
  if (typeof user === 'string') {
    return {
      id: user,
      name: `User-${user.slice(0, 5)}`,
      avatar: `https://i.pravatar.cc/150?u=${user.slice(-5)}`
    };
  }
  return {
    id: user._id,
    name: user.name || `User-${user._id.slice(0, 5)}`,
    avatar: user.avatar || `https://i.pravatar.cc/150?u=${user._id.slice(-5)}`
  };
};

export default function Comment({ comment, depth = 0, onDeleted, postId, refreshComments, user }) {
//   const { user } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [upvotes, setUpvotes] = useState(comment.upvotes);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await api.post(`/comments/${postId}`, { text: replyText, parentId: comment._id });
      setReplyText('');
      setShowReply(false);
      refreshComments();
    } catch {
      alert('Failed to post reply');
    }
  };

  const handleUpvote = async () => {
    try {
      const res = await api.post(`/comments/upvote/${comment._id}`);
      setUpvotes(res.data.upvotes);
    } catch {
      alert('Failed to upvote');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${comment._id}`);
      onDeleted();
    } catch {
      alert('Failed to delete comment');
    }
  };

  function getUserInfo(user) {
    if (!user) {
        return { name: 'Guest', avatar: 'https://i.pravatar.cc/150?u=unknown' };
    }
    if (typeof user === 'object' && user.name && user.avatar) {
        return { name: user.name, avatar: user.avatar, id: user._id || user.id };
    }
    return {
        name: `User-${user.slice(0, 5)}`,
        avatar: `https://i.pravatar.cc/150?u=${user}`,
        id: user
    };
  }

  const commentUser = getUserInfo(comment.user);
  const createdAt = comment.createdAt || comment.created_at;

  return (
    <div style={{ marginLeft: depth * 20, borderLeft: depth ? '1px solid #ccc' : 'none', paddingLeft: 10, marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={commentUser.avatar} alt={commentUser.name} style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 8 }} />
        <strong>{commentUser.name}</strong>
        <small style={{ marginLeft: 10, color: '#777' }}>{createdAt ? new Date(createdAt).toLocaleString() : ''}</small>
      </div>
      <div style={{ marginTop: 5 }}>
        <button onClick={() => setCollapsed(!collapsed)} style={{ fontSize: 12, marginRight: 10 }}>
          {collapsed ? '[+]' : '[-]'}
        </button>
        <span>{comment.text}</span>
      </div>
      {!collapsed && (
        <>
          <div style={{ marginTop: 5, fontSize: 12, color: '#555' }}>
            <button onClick={handleUpvote} style={{ marginRight: 10 }}>
              Upvote ({upvotes})
            </button>
            <button onClick={() => setShowReply(!showReply)} style={{ marginRight: 10 }}>
              Reply
            </button>
            {(user?.isAdmin || user?.id === commentUser.id) && (
              <button onClick={handleDelete} style={{ color: 'red' }}>Delete</button>
            )}
          </div>

          {showReply && (
            <form onSubmit={handleReplySubmit} style={{ marginTop: 10 }}>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={2}
                style={{ width: '100%' }}
                placeholder="Write your reply..."
                required
              />
              <button type="submit" style={{ marginTop: 5 }}>
                Post Reply
              </button>
            </form>
          )}

          <div>
            {comment.replies.map(reply => (
              <Comment key={reply._id} comment={reply} depth={depth + 1} onDeleted={refreshComments} postId={postId} refreshComments={refreshComments} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}