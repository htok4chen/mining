# 矿业信息服务平台（mining）

本仓库提供适配 **Windows + IIS 反向代理 + Node.js API + MySQL** 的矿业信息服务平台实现。

## 1. 已实现模块清单

### 前台（静态站点）
- 首页（logo+导航、广告位、新闻列表、专家滚动展示、矿权融资筛选与列表）
- 关于我们
- 产品展示（含详情页 `/product-detail.html?id=...`）
- 新闻资讯（含详情页 `/news-detail.html?id=...`）
- 企业相册（含详情页 `/album-detail.html?id=...`）
- 专家详情页（`/expert-detail.html?id=...`）
- 融资项目详情页（`/finance-detail.html?id=...`，含在线洽谈表单）
- 广告详情页（`/ad-detail.html?id=...`）
- 留言反馈
- 联系我们

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

## 4. 本地运行步骤

1. 复制环境变量
   - `copy .env.example .env`（Windows）
   - 设置 `JWT_SECRET` 为强随机字符串（必填）
2. 安装依赖
   - `npm install`
3. 初始化数据库
   - 执行 `sql/init.sql`
4. 启动服务
   - `node src/app.js`
5. 访问页面
   - 前台：`http://localhost:9080/`
   - 后台：`http://localhost:9080/admin/`

默认管理员：
- 用户名：`admin`
- 密码：`admin123`

## 5. Windows 部署脚本

- 依赖提示：`install_prerequisites_windows_offline.ps1`
- 部署入口：`deploy_windows.ps1`

脚本会执行：
1. `npm install`
2. 导入 `sql/init.sql`
3. 启动 `node src/app.js`

## 6. IIS 反向代理建议

- 将 `/api` 反向代理到 Node 服务
- 将 `/uploads` 指向 Node 静态目录（已在应用内开放）
