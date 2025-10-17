import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import Post from './components/Post';
import CommentList from './components/CommentList';
import useAuth from './hooks/useAuth';

function MainApp() {
  const { user } = useAuth();
  const POST_ID = 'post-123'; // example post id

  if (!user) return <AuthPage />;

  return (
    <>
      <Post />
      <CommentList postId={POST_ID} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}