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
- **用户登录页**（`/login.html`）
- **用户注册页**（`/register.html`）

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

#### 普通管理员操作流程

1. 打开后台地址，输入用户名和密码，点击「登录」。
2. 左侧折叠菜单按分类展示管理模块；点击分类标题可展开/收起，展开状态自动保存。
3. 点击菜单项进入对应管理列表。
4. **新增**：点击「+ 新增」按钮，弹出表单，填写必填字段（带 * 标记），点击「确认」保存。
5. **编辑**：点击列表行的「编辑」按钮，弹出已有数据的表单，修改后点击「确认」。
6. **删除**：点击「删除」后出现二次确认弹窗，确认后不可恢复。
7. **启停**：点击「启用」/「停用」按钮，即时切换发布状态。
8. **搜索**：部分模块顶部有搜索栏（分类、省份、状态等），填写后点击「搜索」；点击「重置」清除条件。
9. **留言/洽谈**：点击「处理/回复」按钮，可查看原始内容并填写回复，同时切换处理状态。
10. **注册用户**：点击「查看」查看完整注册信息；点击「启用」/「停用」启停用户账号。

#### 交互设计说明

- 所有写操作（新增、编辑、删除、启停、回复）均有成功/失败 Toast 提示。
- 删除操作有二次确认弹窗，防止误删。
- 表单必填字段验证即时提示，字段边框变红并显示错误信息。
- 登录令牌过期自动跳回登录页。
- 数据加载中显示"⏳ 加载中..."，无数据显示空状态引导提示。
- 菜单折叠状态通过 localStorage 记忆，刷新后保持。

## 2. 数据库新增表清单

- `admin_user`
- `news_category`
- `news`
- `ads_position`
- `ads`
- `expert`
- `mining_category`
- `mining_financing`
- `mining_inquiry`
- `product`
- `album`
- `message_feedback`
- `site_config`
- `end_user`（注册用户表）

> 初始化 SQL：`/sql/init.sql`（含种子数据）

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
- `POST /api/public/mining-inquiries` — 提交融资洽谈

### Public Auth API（用户注册与登录）
- `POST /api/public/auth/register` — 用户注册（返回 `{ message, id }`）
- `POST /api/public/auth/login` — 用户登录（返回 `{ token, account_username, real_name }`，限频：15 分钟内最多 20 次）
- `GET  /api/public/auth/me` — 获取当前用户信息（需 Bearer Token，role=user）
- `POST /api/public/auth/logout` — 退出登录（仅服务端确认；客户端删除 localStorage 中的 `user_token` / `user_name`）

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

## 5. 验收清单

- [ ] **成功注册**：访问 `/register.html`，填写所有必填项，点击「注册」，跳转到登录页并提示成功
- [ ] **重复注册检测**：再次用同一用户名/邮箱/手机注册，显示友好错误提示
- [ ] **成功登录**：在 `/login.html` 输入正确账号密码，跳转首页，导航栏显示用户名
- [ ] **me 接口鉴权**：带正确 Token 请求 `GET /api/public/auth/me` 返回用户信息；不带或过期 Token 返回 401
- [ ] **管理员用户列表**：在后台「用户管理 → 注册用户」看到已注册用户列表
- [ ] **查看用户详情**：点击「查看」弹出完整注册信息
- [ ] **启用/禁用账号**：点击「停用」后再登录返回 401，点击「启用」后可正常登录

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
