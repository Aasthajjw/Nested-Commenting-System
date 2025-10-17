import React from 'react';

export default function Post() {
  return (
    <div style={{ maxWidth: "90%", maxHeight: "30%", margin: '20px auto' }}>
      <h1>Sample Article Post</h1>
      <img
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80"
        alt="Post"
        style={{ width: '100%', borderRadius: 8, marginBottom: 20 }}
      />
      <p>
        This is a sample post content. Comments below are nested to show replies and replies of replies.
      </p>
    </div>
  );
}