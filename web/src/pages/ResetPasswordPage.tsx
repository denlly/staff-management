import { useState } from 'react';
import axios from 'axios';
import { apiClient } from '../api/client';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const parseError = (err: unknown) => {
    if (!axios.isAxiosError(err)) {
      return '请求失败，请稍后重试';
    }
    const msg = err.response?.data?.message ?? '请求失败，请稍后重试';
    return Array.isArray(msg) ? msg.join(', ') : msg;
  };

  const handleRequestToken = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await apiClient.post<{
        message: string;
        resetToken?: string;
      }>('/auth/forgot-password', { email });
      setMessage(
        response.data.resetToken
          ? `${response.data.message}，请复制令牌：${response.data.resetToken}`
          : response.data.message,
      );
    } catch (err) {
      setError(parseError(err));
    }
  };

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await apiClient.post<{ message: string }>('/auth/reset-password', {
        token,
        newPassword,
      });
      setMessage(response.data.message);
    } catch (err) {
      setError(parseError(err));
    }
  };

  return (
    <section className="grid-2">
      <form className="card form" onSubmit={handleRequestToken}>
        <h2>第一步：获取重置令牌</h2>
        <label>
          注册邮箱
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <button type="submit">发送重置请求</button>
      </form>

      <form className="card form" onSubmit={handleResetPassword}>
        <h2>第二步：提交新密码</h2>
        <label>
          重置令牌
          <input value={token} onChange={(event) => setToken(event.target.value)} required />
        </label>
        <label>
          新密码
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            minLength={6}
          />
        </label>
        <button type="submit">完成重置</button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}
