import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const { user } = useAuth();

  return (
    <section className="card hero">
      <h1>用户管理系统</h1>
      <p>
        一个基于 React + NestJS + SQLite 的完整课程项目，支持用户认证、密码重置和业务数据 CRUD。
      </p>
      <div className="row">
        {user ? (
          <Link className="button-link" to="/dashboard">
            进入数据管理
          </Link>
        ) : (
          <>
            <Link className="button-link" to="/login">
              立即登录
            </Link>
            <Link className="button-link secondary" to="/register">
              新用户注册
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
