const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
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

const paginate = (value, fallback) => Math.max(Number(value || fallback), 1);

const listFactory = (table, orderBy = 'id DESC') => async (req, res, next) => {
  try {
    if (!SAFE_TABLE.test(table) || !SAFE_ORDER.test(orderBy)) {
      return res.status(500).json({ message: 'SQL配置异常' });
    }
    const page = paginate(req.query.page, 1);
    const pageSize = Math.min(paginate(req.query.page_size, 20), 100);
    const [rows] = await db.query(`SELECT * FROM ${table} ORDER BY ${orderBy} LIMIT ?, ?`, [(page - 1) * pageSize, pageSize]);
    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM ${table}`);
    res.json({ list: rows, total: countRows[0].total, page, pageSize });
  } catch (e) { next(e); }
};

const crudFactory = ({ table, fields, orderBy }) => {
  const base = express.Router();
  base.get('/', listFactory(table, orderBy));
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

router.use('/news-categories', crudFactory({ table: 'news_category', fields: ['name', 'status', 'sort'], orderBy: 'sort ASC, id DESC' }));
router.use('/news', crudFactory({ table: 'news', fields: ['category_id', 'title', 'summary', 'content', 'cover_image', 'publish_time', 'status', 'sort'], orderBy: 'publish_time DESC, id DESC' }));
router.use('/ads-positions', crudFactory({ table: 'ads_position', fields: ['name', 'code', 'status', 'sort'], orderBy: 'sort ASC, id DESC' }));
router.use('/ads', crudFactory({ table: 'ads', fields: ['position_id', 'title', 'image_url', 'link_url', 'start_time', 'end_time', 'status', 'sort'], orderBy: 'sort ASC, id DESC' }));
router.use('/experts', crudFactory({ table: 'expert', fields: ['name', 'avatar', 'intro', 'resume', 'status', 'sort'], orderBy: 'sort ASC, id DESC' }));
router.use('/mining-categories', crudFactory({ table: 'mining_category', fields: ['name', 'status', 'sort'], orderBy: 'sort ASC, id DESC' }));
router.use('/mining-financing', crudFactory({ table: 'mining_financing', fields: ['category_id', 'title', 'province', 'city', 'region_desc', 'price_ref', 'summary', 'detail', 'publish_time', 'status', 'sort'], orderBy: 'publish_time DESC, id DESC' }));
router.use('/products', crudFactory({ table: 'product', fields: ['name', 'cover_image', 'description', 'status', 'sort'], orderBy: 'sort ASC, id DESC' }));
router.use('/albums', crudFactory({ table: 'album', fields: ['title', 'image_url', 'description', 'status', 'sort'], orderBy: 'sort ASC, id DESC' }));
router.use('/messages', crudFactory({ table: 'message_feedback', fields: ['name', 'phone', 'email', 'content', 'reply', 'status', 'sort'], orderBy: 'id DESC' }));

router.get('/mining-inquiries', listFactory('mining_inquiry', 'id DESC'));
router.put('/mining-inquiries/:id/reply', async (req, res, next) => {
  try {
    const { reply, status } = req.body;
    await db.query('UPDATE mining_inquiry SET reply = ?, status = ?, updated_at = NOW() WHERE id = ?', [reply ?? null, status ?? 1, req.params.id]);
    res.json({ message: '回复成功' });
  } catch (e) { next(e); }
});

module.exports = router;
