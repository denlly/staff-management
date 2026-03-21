# 用户管理系统（React + NestJS + SQLite）

这是一个完整的前后端课程项目，目标是做出一套可运行、可演示、可部署的用户管理系统。  
项目由 React 前端和 NestJS 后端组成，覆盖了用户认证、密码重置、数据 CRUD、前后端联调、测试以及 Vercel 部署配置。

## 1. 项目功能

### 用户认证
- 用户注册（姓名、邮箱、密码）
- 用户登录（JWT 鉴权）
- 获取当前登录用户信息
- 忘记密码与重置密码（演示环境返回 reset token）

### 数据管理（CRUD）
- 登录后创建记录
- 查询当前用户自己的记录列表
- 更新记录内容
- 删除记录
- 数据按用户隔离，互不影响

### 前端页面
- 首页
- 登录页
- 注册页
- 重置密码页
- 数据管理页（列表 + 新增 + 编辑 + 删除）

## 2. 技术栈与结构

### 技术栈
- 前端：React + TypeScript + Vite + React Router + Axios
- 后端：NestJS + TypeORM + SQLite + JWT + bcrypt
- 测试：Jest（后端单测/e2e），Vitest + Testing Library（前端）
- 部署：Vercel（前后端分开部署）

### 目录结构
```text
staff_management/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/            # 注册/登录/重置密码/JWT
│   │   ├── users/           # 用户实体与服务
│   │   ├── records/         # 业务记录 CRUD
│   │   └── main.ts
│   ├── api/index.ts         # Vercel Serverless 入口
│   └── vercel.json
├── web/                     # React 前端
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── api/
│   └── vercel.json
└── README.md
```

## 3. 本地运行

### 3.1 后端启动
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

默认地址：`http://localhost:3000`  
接口前缀：`/api`

### 3.2 前端启动
```bash
cd web
cp .env.example .env
npm install
npm run dev
```

默认地址：`http://localhost:5173`

## 4. 环境变量

### backend/.env
```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=1d
DB_PATH=data/staff_management.sqlite
```

### web/.env
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 5. 主要接口（后端）

### 认证
- `POST /api/auth/register`：注册
- `POST /api/auth/login`：登录
- `GET /api/auth/me`：获取当前用户
- `POST /api/auth/forgot-password`：申请重置密码
- `POST /api/auth/reset-password`：重置密码

### 记录管理（需 Bearer Token）
- `POST /api/records`：创建记录
- `GET /api/records`：查询当前用户记录
- `PATCH /api/records/:id`：更新记录
- `DELETE /api/records/:id`：删除记录

## 6. 测试与质量检查

### 后端
```bash
cd backend
npm run lint
npm run test
npm run test:e2e
npm run build
```

### 前端
```bash
cd web
npm run lint
npm run test
npm run build
```

## 7. 部署到 Vercel（前后端）

建议将 `web` 和 `backend` 分别作为两个 Vercel 项目部署。

### 7.1 部署后端（Nest）
1. 在 Vercel 新建项目，Root Directory 指向 `backend`
2. 构建配置使用仓库默认（已提供 `backend/vercel.json`）
3. 配置环境变量：
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `FRONTEND_ORIGIN`（前端线上域名）
   - `DB_PATH`（建议 `data/staff_management.sqlite`）
4. 首次部署后得到后端域名，例如：`https://your-api.vercel.app`

### 7.2 部署前端（React）
1. 在 Vercel 新建项目，Root Directory 指向 `web`
2. 配置环境变量：
   - `VITE_API_BASE_URL=https://your-api.vercel.app/api`
3. 部署完成后即可访问前端页面

## 8. 关于 SQLite 在 Vercel 的说明

本项目按课程演示需求保留 SQLite。  
需要特别说明：Vercel Serverless 环境不是传统持久磁盘，实例重建后本地文件可能丢失。  
所以当前方案适合功能演示和答辩，不建议直接作为生产级长期存储方案。

如果后续要走生产化，建议切到托管数据库（例如 PostgreSQL 或兼容 SQLite 协议的远程方案）。

## 9. 项目观点与总结

这次实现里我更关注“完整闭环”而不是“堆功能”：  
先把认证、数据模型和权限边界打稳，再把前端页面按真实使用路径串起来，最后通过测试和部署把项目落地。  
这样做的结果是：代码模块清晰、业务链路完整、演示过程顺畅，也更符合一个真正可交付项目的节奏。