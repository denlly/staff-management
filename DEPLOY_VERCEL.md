# Vercel 部署指南（前后端分离）

这份文档用于把当前项目部署到 Vercel，包含：
- 后端 `backend`（NestJS API）
- 前端 `web`（React + Vite）

## 1. 部署前准备

确保本地已经完成一次构建验证：

```bash
cd backend
npm run lint && npm run test && npm run test:e2e && npm run build

cd ../web
npm run lint && npm run test && npm run build
```

如果你还没有 Vercel CLI，可以安装：

```bash
npm i -g vercel
```

## 2. 后端部署（`backend`）

后端已经包含：
- `backend/api/index.ts`（Serverless 入口）
- `backend/vercel.json`（路由与函数配置）

### 2.1 通过 Vercel 控制台部署

1. 打开 [Vercel Dashboard](https://vercel.com/dashboard)  
2. 点击 **Add New Project**，导入当前仓库  
3. Root Directory 选择 `backend`  
4. Framework Preset 选 **Other**（或保持自动识别）  
5. 配置环境变量：
   - `JWT_SECRET`：强随机字符串（必填）
   - `JWT_EXPIRES_IN`：例如 `1d`
   - `FRONTEND_ORIGIN`：前端线上域名（例如 `https://your-web.vercel.app`）
   - `DB_PATH`：`/tmp/staff_management.sqlite`
6. 点击部署，等待完成  

部署成功后会拿到后端地址，例如：
`https://your-api.vercel.app`

### 2.2 通过 CLI 部署（可选）

```bash
cd backend
vercel
```

首次会提示绑定项目。生产部署可用：

```bash
vercel --prod
```

## 3. 前端部署（`web`）

前端已经包含：
- `web/vercel.json`（SPA 路由重写）

### 3.1 通过 Vercel 控制台部署

1. 在 Vercel 再创建一个项目（同仓库）  
2. Root Directory 选择 `web`  
3. 配置环境变量：
   - `VITE_API_BASE_URL=https://your-api.vercel.app/api`
4. 点击部署  

部署成功后会得到前端地址，例如：
`https://your-web.vercel.app`

### 3.2 通过 CLI 部署（可选）

```bash
cd web
vercel
vercel --prod
```

## 4. 联调检查清单

部署完成后按顺序验证：

1. 打开前端首页能正常访问  
2. 注册新账号成功  
3. 登录后进入数据管理页  
4. 新增一条记录并刷新后仍可看到  
5. 编辑、删除记录正常  
6. 重置密码流程可走通  

如果出现跨域问题，优先检查后端 `FRONTEND_ORIGIN` 是否和前端域名一致。

## 5. 关于 SQLite 的重要说明

当前后端使用 SQLite，按课程演示是可行的。  
但 Vercel 的 Serverless 运行环境不保证本地文件长期持久，实例重建后可能出现数据丢失。

这意味着：
- 适合课程演示、功能验收、答辩展示
- 不建议直接作为长期生产数据库方案

若要生产化，建议迁移到托管数据库（如 PostgreSQL）。

## 6. 常见问题排查

### 6.1 前端请求 401
- 检查是否已登录（本地 token 是否存在）
- 检查 `JWT_SECRET` 是否在后端环境变量中正确设置

### 6.2 前端请求 404
- 检查 `VITE_API_BASE_URL` 是否包含 `/api`
- 检查后端项目是否部署成功并可访问

### 6.3 CORS 报错
- 检查后端 `FRONTEND_ORIGIN` 与前端线上域名是否完全一致（协议和域名都一致）

### 6.4 部署成功但数据丢失
- 这是 SQLite + Serverless 的已知行为，属于当前演示部署策略限制
