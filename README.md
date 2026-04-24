# 矿业信息服务平台（mining）

本仓库提供适配 **Windows + IIS 反向代理 + Node.js API + MySQL** 的矿业信息服务平台实现。

## 1. 已实现模块清单

### 前台（静态站点）
- 首页（logo+导航、广告位、新闻局部、专家滚动展示、矿权融资筛选与列表）
- 关于我们
- 产品展示
- 新闻资讯
- 企业相册
- 留言反馈
- 联系我们

### 后台（/admin）
- 管理员登录（JWT）
- 新闻管理 / 新闻分类
- 广告管理 / 广告位管理（位置）
- 矿权融资管理 / 融资分类维护
- 融资洽谈留言记录与回复接口
- 专家信息管理（仅展示，不提供咨询流程）
- 留言反馈管理（状态/回复字段）

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
- `GET /api/public/news`
- `GET /api/public/news/:id`
- `GET /api/public/ads?position=...`
- `GET /api/public/experts`
- `GET /api/public/mining-financing`
- `GET /api/public/albums`
- `GET /api/public/products`
- `POST /api/public/messages`
- `POST /api/public/mining-inquiries`

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
