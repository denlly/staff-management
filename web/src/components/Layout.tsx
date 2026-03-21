import { Link, NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <header className="topbar">
        <Link className="brand" to="/">
          Staff Management
        </Link>
        <nav className="menu">
          <NavLink to="/">首页</NavLink>
          {user && <NavLink to="/dashboard">数据管理</NavLink>}
        </nav>
        <div className="actions">
          {user ? (
            <>
              <span className="muted">你好，{user.name}</span>
              <button onClick={logout}>退出</button>
            </>
          ) : (
            <>
              <NavLink to="/login">登录</NavLink>
              <NavLink to="/register">注册</NavLink>
            </>
          )}
        </div>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
