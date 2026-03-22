import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';


export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? '登录失败，请稍后重试')
        : '登录失败，请稍后重试';
      setError(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  return (
    <form className="card form narrow" onSubmit={handleSubmit}>
      <h2>用户登录</h2>
      {error && <p className="error">{error}</p>}
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
        {loading ? '登录中...' : '登录'}
      </button>
      <p className="muted">
        没有账号？<Link to="/register">去注册</Link> | <Link to="/reset-password">忘记密码</Link>
      </p>
    </form>
  );
}
