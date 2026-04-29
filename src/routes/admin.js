const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const db = require('../services/db');
const auth = require('../middleware/auth');
const { jwtSecret } = require('../config/security');

const router = express.Router();
const SAFE_TABLE = /^[a-z_]+$/i;
const SAFE_ORDER = /^[a-z_]+(\s+(ASC|DESC))?(,\s*[a-z_]+(\s+(ASC|DESC))?)*$/i;
const DUMMY_BCRYPT_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8x8zY4xXHzkwmo7aX6ixkmKuuNHYsW';

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query('SELECT id, username, password_hash, status FROM admin_user WHERE username = ? LIMIT 1', [username]);
    const user = rows[0];
    if (!user || user.status !== 1) return res.status(401).json({ message: '用户名或密码错误' });
    const passwordHash = user.password_hash || '';
    const hashForCompare = passwordHash.startsWith('$2') ? passwordHash : DUMMY_BCRYPT_HASH;
    const passwordOk = await bcrypt.compare(password || '', hashForCompare);
    if (!passwordOk || !passwordHash.startsWith('$2')) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '12h' });
    res.json({ token, username: user.username });
  } catch (e) { next(e); }
});

router.use(auth);

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      cb(null, `adm-${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\//i.test(file.mimetype || ''))
});

const paginate = (value, fallback) => Math.max(Number(value || fallback), 1);
const SAFE_COLUMN_NAME = /^[a-z_]+$/i;

const listFactory = (table, orderBy = 'id DESC', filterCols = []) => async (req, res, next) => {
  try {
    if (!SAFE_TABLE.test(table) || !SAFE_ORDER.test(orderBy)) {
      return res.status(500).json({ message: 'SQL配置异常' });
    }
    const page = paginate(req.query.page, 1);
    const pageSize = Math.min(paginate(req.query.page_size, 20), 100);
    const where = [];
    const params = [];
    filterCols.forEach((col) => {
      if (!SAFE_COLUMN_NAME.test(col)) return;
      const val = req.query[col];
      if (val !== undefined && val !== '') {
        where.push(`${col} = ?`);
        params.push(val);
      }
    });
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await db.query(`SELECT * FROM ${table} ${whereClause} ORDER BY ${orderBy} LIMIT ?, ?`, [...params, (page - 1) * pageSize, pageSize]);
    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM ${table} ${whereClause}`, params);
    res.json({ list: rows, total: countRows[0].total, page, pageSize });
  } catch (e) { next(e); }
};

const crudFactory = ({ table, fields, orderBy, filterCols = [] }) => {
  const base = express.Router();
  base.get('/', listFactory(table, orderBy, filterCols));
  base.get('/:id', async (req, res, next) => {
    try {
      const [rows] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
      if (!rows.length) return res.status(404).json({ message: '记录不存在' });
      res.json(rows[0]);
    } catch (e) { next(e); }
  });

  base.post('/', async (req, res, next) => {
    try {
      const payload = {};
      fields.forEach((f) => { if (req.body[f] !== undefined) payload[f] = req.body[f]; });
      if (!Object.keys(payload).length) return res.status(400).json({ message: '无有效字段' });
      payload.created_at = new Date();
      payload.updated_at = new Date();
      const [result] = await db.query(`INSERT INTO ${table} SET ?`, [payload]);
      res.json({ id: result.insertId, message: '创建成功' });
    } catch (e) { next(e); }
  });

  base.put('/:id', async (req, res, next) => {
    try {
      const payload = {};
      fields.forEach((f) => { if (req.body[f] !== undefined) payload[f] = req.body[f]; });
      if (!Object.keys(payload).length) return res.status(400).json({ message: '无有效字段' });
      payload.updated_at = new Date();
      await db.query(`UPDATE ${table} SET ? WHERE id = ?`, [payload, req.params.id]);
      res.json({ message: '更新成功' });
    } catch (e) { next(e); }
  });

  base.delete('/:id', async (req, res, next) => {
    try {
      await db.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
      res.json({ message: '删除成功' });
    } catch (e) { next(e); }
  });

  return base;
};

router.use('/news-categories', crudFactory({ table: 'news_category', fields: ['name', 'status', 'sort'], orderBy: 'sort ASC, id DESC', filterCols: ['status'] }));
router.use('/news', crudFactory({ table: 'news', fields: ['category_id', 'title', 'summary', 'content', 'cover_image', 'publish_time', 'status', 'sort'], orderBy: 'publish_time DESC, id DESC', filterCols: ['category_id', 'status'] }));
router.use('/ads-positions', crudFactory({ table: 'ads_position', fields: ['name', 'code', 'status', 'sort'], orderBy: 'sort ASC, id DESC', filterCols: ['status'] }));
router.use('/ads', crudFactory({ table: 'ads', fields: ['position_id', 'title', 'image_url', 'link_url', 'start_time', 'end_time', 'status', 'sort'], orderBy: 'sort ASC, id DESC', filterCols: ['position_id', 'status'] }));
router.use('/experts', crudFactory({ table: 'expert', fields: ['name', 'avatar', 'card_image', 'intro', 'resume', 'status', 'sort'], orderBy: 'sort ASC, id DESC', filterCols: ['status'] }));
router.use('/mining-categories', crudFactory({ table: 'mining_category', fields: ['name', 'status', 'sort'], orderBy: 'sort ASC, id DESC', filterCols: ['status'] }));
router.use('/mining-financing', crudFactory({ table: 'mining_financing', fields: ['category_id', 'title', 'province', 'city', 'region_desc', 'price_ref', 'summary', 'detail', 'publish_time', 'status', 'sort'], orderBy: 'publish_time DESC, id DESC', filterCols: ['category_id', 'province', 'status'] }));
router.use('/products', crudFactory({ table: 'product', fields: ['name', 'cover_image', 'description', 'status', 'sort'], orderBy: 'sort ASC, id DESC', filterCols: ['status'] }));
router.use('/albums', crudFactory({ table: 'album', fields: ['title', 'image_url', 'description', 'status', 'sort'], orderBy: 'sort ASC, id DESC', filterCols: ['status'] }));
router.use('/messages', crudFactory({ table: 'message_feedback', fields: ['name', 'phone', 'email', 'content', 'reply', 'status', 'sort'], orderBy: 'id DESC', filterCols: ['status'] }));

router.post('/upload-image', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: '请上传图片文件' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

router.put('/password', async (req, res, next) => {
  try {
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) return res.status(400).json({ message: '旧密码和新密码不能为空' });
    if (String(new_password).length < 6) return res.status(400).json({ message: '新密码至少 6 位' });
    const [rows] = await db.query('SELECT id, password_hash FROM admin_user WHERE id = ? LIMIT 1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: '管理员不存在' });
    const ok = await bcrypt.compare(String(old_password), rows[0].password_hash || '');
    if (!ok) return res.status(400).json({ message: '旧密码错误' });
    const password_hash = await bcrypt.hash(String(new_password), 10);
    await db.query('UPDATE admin_user SET password_hash = ?, updated_at = NOW() WHERE id = ?', [password_hash, req.user.id]);
    res.json({ message: '管理员密码已更新' });
  } catch (e) { next(e); }
});

router.get('/mining-inquiries', listFactory('mining_inquiry', 'id DESC', ['status']));
router.put('/mining-inquiries/:id/reply', async (req, res, next) => {
  try {
    const { reply, status } = req.body;
    await db.query('UPDATE mining_inquiry SET reply = ?, status = ?, updated_at = NOW() WHERE id = ?', [reply ?? null, status ?? 1, req.params.id]);
    res.json({ message: '回复成功' });
  } catch (e) { next(e); }
});

router.get('/end-users', listFactory('end_user', 'id DESC', ['status']));
router.get('/end-users/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT id, account_username, real_name, gender, title_or_position,
              email, phone, landline_country_code, landline_area_code, landline_number,
              fax_country_code, fax_area_code, fax_number,
              company_name, business_scope, status, created_at, updated_at
       FROM end_user WHERE id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: '用户不存在' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});
router.put('/end-users/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (status !== 0 && status !== 1) return res.status(400).json({ message: '状态值无效' });
    await db.query('UPDATE end_user SET status = ?, updated_at = NOW() WHERE id = ?', [status, req.params.id]);
    res.json({ message: status === 1 ? '账号已启用' : '账号已禁用' });
  } catch (e) { next(e); }
});

router.post('/end-users/reset-password', async (req, res, next) => {
  try {
    const { account_username, new_password } = req.body;
    if (!account_username || !new_password) return res.status(400).json({ message: '用户名和新密码必填' });
    if (String(new_password).length < 6) return res.status(400).json({ message: '新密码至少 6 位' });
    const [rows] = await db.query('SELECT id FROM end_user WHERE account_username = ? LIMIT 1', [account_username]);
    if (!rows.length) return res.status(404).json({ message: '用户不存在' });
    const password_hash = await bcrypt.hash(String(new_password), 10);
    await db.query('UPDATE end_user SET password_hash = ?, updated_at = NOW() WHERE id = ?', [password_hash, rows[0].id]);
    res.json({ message: '用户密码已重置' });
  } catch (e) { next(e); }
});

module.exports = router;
