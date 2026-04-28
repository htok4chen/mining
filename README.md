# 矿业信息服务平台（mining）

本仓库提供适配 **Windows + IIS 反向代理 + Node.js API + MySQL** 的矿业信息服务平台实现。

## 1. 已实现模块清单

### 前台（静态站点）
- 首页（logo+导航、广告位、最新动态列表 + "更多"链接跳转 `/news.html`、专家信息滚动展示 + "更多"链接跳转 `/experts.html`、矿权融资预览 + "更多"链接跳转 `/finance.html`、中部广告位）
  - **布局说明**：顶部信息条（版权/地址/电话）已移至页面底部页脚区域，主导航仅保留 logo + 导航链接。
  - **首页区块顺序**：最新动态 → 专家信息 → 矿权融资 → 中部广告位
- 关于我们
- 产品展示（含详情页 `/product-detail.html?id=...`）
- 新闻资讯（含详情页 `/news-detail.html?id=...`）
- 专家展示列表（`/experts.html`，含"更多"入口，点击可查看专家详情 `/expert-detail.html?id=...`）
- 矿权融资列表（`/finance.html`，含筛选功能，含详情页 `/finance-detail.html?id=...`）
- 企业相册（含详情页 `/album-detail.html?id=...`）
- 广告详情页（`/ad-detail.html?id=...`）
- 留言反馈
- 联系我们
- **用户登录页**（`/login.html`，支持 `?redirect=<URL>` 登录后自动跳回原页面）
- **用户注册页**（`/register.html`）
- **用户中心**（`/user-center.html`，需登录）

### 用户中心（需登录，导航栏显示"用户中心"入口）

| 页面 | 路径 | 说明 |
|------|------|------|
| 个人中心 | `/user-center.html` | 概览：用户信息、统计数字、快捷入口 |
| 我的融资信息 | `/user-financing.html` | 查看/发布/编辑/删除/上下线自己的融资项目 |
| 收到的洽谈 | `/user-received.html` | 他人对我的融资信息提交的洽谈申请 |
| 我的洽谈记录 | `/user-sent.html` | 我对他人融资信息提交的洽谈历史 |

**在线洽谈登录保护**：
- 已登录用户在 `/finance-detail.html` 可直接看到洽谈表单并提交。
- 未登录用户看到"请先登录后提交洽谈"提示，点击"立即登录"跳转 `/login.html?redirect=<当前页>`，登录后自动返回。

### 后台（/admin）

> 路径：`http://localhost:9080/admin/`  
> 默认账号：用户名 `admin`，密码 `admin123`

#### 管理菜单结构（折叠侧边栏）

| 分类       | 子模块                 | 支持操作                             |
|----------|---------------------|----------------------------------|
| 内容管理   | 新闻分类              | 列表、新增、编辑、删除、启停            |
|           | 新闻管理              | 列表、搜索（分类/状态）、新增、编辑、删除、启停 |
| 广告管理   | 广告位管理            | 列表、新增、编辑、删除、启停            |
|           | 广告管理              | 列表、搜索（广告位/状态）、新增、编辑、删除、启停 |
| 矿权管理   | 融资分类              | 列表、新增、编辑、删除、启停            |
|           | 矿权融资              | 列表、搜索（分类/省份/状态）、新增、编辑、删除、启停 |
| 专家管理   | 专家信息              | 列表、新增、编辑、删除、启停            |
| 产品与相册 | 产品管理              | 列表、新增、编辑、删除、启停            |
|           | 企业相册              | 列表、新增、编辑、删除、启停            |
| 留言与咨询 | 留言反馈              | 列表、搜索（状态）、查看、回复/处理、删除  |
|           | 融资洽谈              | 列表、搜索（状态）、查看、回复/处理       |
| 用户管理   | 注册用户              | 列表、搜索（状态）、查看详情、启用/禁用    |

## 2. 数据库表清单

- `admin_user`
- `news_category`
- `news`
- `ads_position`
- `ads`
- `expert`
- `mining_category`
- `mining_financing`（含 `user_id` 列，记录用户发布的融资信息）
- `mining_inquiry`（含 `user_id` 列，记录已登录用户提交的洽谈）
- `product`
- `album`
- `message_feedback`
- `site_config`
- `end_user`（注册用户表）

> 初始化 SQL：`/sql/init.sql`（含种子数据，升级脚本自动为已有表添加新列）

## 3. API 清单

### Public API
- `GET /api/public/news` — 新闻列表（支持 `category_id`、`page`、`page_size`）
- `GET /api/public/news/:id` — 新闻详情
- `GET /api/public/ads?position=...` — 广告列表（按位置）
- `GET /api/public/ads/:id` — 广告详情
- `GET /api/public/experts` — 专家列表
- `GET /api/public/experts/:id` — 专家详情
- `GET /api/public/mining-financing` — 矿权融资列表（支持 `category_id`、`province`、`city`、`keyword`、`sort`、`page`、`page_size`）
- `GET /api/public/mining-financing/:id` — 融资项目详情
- `GET /api/public/albums` — 相册列表
- `GET /api/public/albums/:id` — 相册详情
- `GET /api/public/products` — 产品列表
- `GET /api/public/products/:id` — 产品详情
- `POST /api/public/messages` — 提交留言
- `POST /api/public/mining-inquiries` — 提交融资洽谈（已登录用户自动关联 user_id）

### Public Auth API（用户注册与登录）
- `POST /api/public/auth/register` — 用户注册（返回 `{ message, id }`）
- `POST /api/public/auth/login` — 用户登录（返回 `{ token, account_username, real_name }`，限频：15 分钟内最多 20 次）
- `GET  /api/public/auth/me` — 获取当前用户信息（需 Bearer Token，role=user）
- `POST /api/public/auth/logout` — 退出登录（仅服务端确认；客户端删除 localStorage 中的 `user_token` / `user_name`）

### User API（需登录，Bearer Token，role=user）
- `GET  /api/user/my-financing` — 我发布的融资信息列表
- `POST /api/user/my-financing` — 发布新融资信息
- `GET  /api/user/my-financing/:id` — 查看自己的某条融资信息
- `PUT  /api/user/my-financing/:id` — 编辑自己的融资信息（含上/下线）
- `DELETE /api/user/my-financing/:id` — 删除自己的融资信息
- `GET  /api/user/my-financing/:id/inquiries` — 查看某条融资信息收到的洽谈
- `GET  /api/user/received-inquiries` — 查看所有融资信息收到的洽谈
- `GET  /api/user/my-inquiries` — 我提交的洽谈记录

### Admin API（需登录）
- `POST /api/admin/login`
- CRUD：
  - `/api/admin/news-categories`
  - `/api/admin/news`
  - `/api/admin/ads-positions`
  - `/api/admin/ads`
  - `/api/admin/experts`
  - `/api/admin/mining-categories`
  - `/api/admin/mining-financing`
  - `/api/admin/products`
  - `/api/admin/albums`
  - `/api/admin/messages`
- `GET /api/admin/mining-inquiries`
- `PUT /api/admin/mining-inquiries/:id/reply`
- `GET /api/admin/end-users` — 注册用户列表（支持 `status`、`page`、`page_size`）
- `GET /api/admin/end-users/:id` — 注册用户详情
- `PUT /api/admin/end-users/:id` — 更新用户状态（仅接受 `{ status: 0|1 }`）

## 4. 本地运行步骤

1. 复制环境变量
   - `copy .env.example .env`（Windows）
   - 设置 `JWT_SECRET` 为强随机字符串（**必填**，不能为 `change-me`）
2. 安装依赖
   - `npm install`
3. 初始化数据库
   - 执行 `sql/init.sql`
4. 启动服务
   - `node src/app.js`
5. 访问页面
   - 前台：`http://localhost:9080/`
   - 前台登录：`http://localhost:9080/login.html`
   - 前台注册：`http://localhost:9080/register.html`
   - **用户中心**：`http://localhost:9080/user-center.html`
   - 后台：`http://localhost:9080/admin/`

默认管理员：
- 用户名：`admin`
- 密码：`admin123`

### 必要环境变量

| 变量名        | 说明                              | 示例                       |
|-------------|--------------------------------|--------------------------|
| `PORT`      | 服务端口（可选，默认 9008）           | `9008`                   |
| `DB_HOST`   | MySQL 主机地址                     | `127.0.0.1`              |
| `DB_PORT`   | MySQL 端口                        | `3306`                   |
| `DB_USER`   | MySQL 用户名                      | `root`                   |
| `DB_PASSWORD` | MySQL 密码                      | `yourpassword`           |
| `DB_NAME`   | 数据库名                           | `mining`                 |
| `JWT_SECRET` | JWT 签名密钥（**必须设置为强随机字符串**） | `your-strong-secret-key` |

> 生成强随机密钥示例：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 5. 验收清单

### 注册 / 登录
- [ ] 访问 `/register.html`，填写所有必填项，点击「注册」，跳转到登录页并提示成功
- [ ] 重复用户名/邮箱/手机注册，显示友好错误提示
- [ ] 在 `/login.html` 输入正确账号密码，跳转首页，导航栏出现「用户中心」入口
- [ ] 未登录时导航栏显示「登录」和「注册」

### 用户中心
- [ ] 登录后点击导航栏「用户中心」进入 `/user-center.html`，展示用户信息与统计数字
- [ ] 未登录直接访问 `/user-center.html`，自动跳转登录页
- [ ] 在「我的融资信息」页面成功发布新融资信息，列表即时刷新
- [ ] 编辑、上下线、删除自己的融资信息均生效
- [ ] 编辑/删除其他用户的融资信息接口返回 404（权限隔离）
- [ ] 「收到的洽谈」页面展示他人对我融资信息的洽谈申请
- [ ] 「我的洽谈记录」页面展示自己提交过的洽谈历史

### 在线洽谈登录保护
- [ ] 未登录访问融资详情页 `/finance-detail.html?id=...`，看到「请先登录」提示而非表单
- [ ] 点击「立即登录」跳转到 `/login.html?redirect=<融资详情URL>`
- [ ] 登录成功后自动跳回融资详情页，且现在可以看到洽谈表单
- [ ] 已登录用户提交洽谈成功，在「我的洽谈记录」中可查看

### 后台兼容
- [ ] 管理员后台功能（新闻、广告、矿权融资等 CRUD）不受影响
- [ ] 管理员在「融资洽谈」列表可看到用户提交的洽谈记录

## 6. Windows 部署脚本

- 依赖提示：`install_prerequisites_windows_offline.ps1`
- 部署入口：`deploy_windows.ps1`

脚本会执行：
1. `npm install`
2. 导入 `sql/init.sql`
3. 启动 `node src/app.js`

## 7. IIS 反向代理建议

- 将 `/api` 反向代理到 Node 服务
- 将 `/uploads` 指向 Node 静态目录（已在应用内开放）
