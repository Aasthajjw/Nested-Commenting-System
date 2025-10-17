import React, { useState } from 'react';
import api from '../api';
import useAuth from '../hooks/useAuth';

export default function AuthPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Optional domain restriction example: allow only emails ending with '@example.com'
  const emailDomainAllowed = email.endsWith('@example.com');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!emailDomainAllowed) {
      setError('Email domain not allowed.');
      return;
    }
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister
        ? { name, email, password, avatar: `https://i.pravatar.cc/150?u=${email}` }
        : { email, password };

      const response = await api.post(endpoint, payload);
      localStorage.setItem('token', response.data.token);
      login(response.data.token);
    } catch (e) {
      setError(e.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
            required
            style={{ width: '100%', marginBottom: 10 }}
          />
        )}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email (must be @example.com)"
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: 10 }}>
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: 10 }}>
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button onClick={() => setIsRegister(!isRegister)} style={{ color: 'blue', background: 'none', border: 'none', cursor: 'pointer' }}>
          {isRegister ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  );
}