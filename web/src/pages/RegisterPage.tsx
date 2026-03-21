import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? '注册失败，请稍后重试')
        : '注册失败，请稍后重试';
      setError(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  return (
    <form className="card form narrow" onSubmit={handleSubmit}>
      <h2>用户注册</h2>
      {error && <p className="error">{error}</p>}
      <label>
        姓名
        <input value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label>
        邮箱
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label>
        密码
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
        />
      </label>
      <button disabled={loading} type="submit">
        {loading ? '注册中...' : '注册并登录'}
      </button>
      <p className="muted">
        已有账号？<Link to="/login">去登录</Link>
      </p>
    </form>
  );
}
