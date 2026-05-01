const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../services/db');
const { ensureNoForbiddenWords } = require('../services/forbiddenWords');
const { jwtSecret } = require('../config/security');

const router = express.Router();

const buildListResult = async (baseSql, countFromSql, whereSql, params, page, pageSize, orderSql = ' ORDER BY id DESC') => {
  const p = Math.max(Number(page || 1), 1);
  const s = Math.min(Math.max(Number(pageSize || 10), 1), 100);
  const sql = `${baseSql} ${whereSql}${orderSql} LIMIT ?, ?`;
  const countSql = `SELECT COUNT(*) AS total ${countFromSql} ${whereSql}`;
  const [list] = await db.query(sql, [...params, (p - 1) * s, s]);
  const [countRows] = await db.query(countSql, params);
  return { list, total: countRows[0].total, page: p, pageSize: s };
};

router.get('/news', async (req, res, next) => {
  try {
    const where = ['WHERE n.status = 1'];
    const params = [];
    if (req.query.category_id) {
      where.push('AND n.category_id = ?');
      params.push(req.query.category_id);
    }
    const data = await buildListResult(
      'SELECT n.*, c.name AS category_name FROM news n LEFT JOIN news_category c ON c.id = n.category_id',
      'FROM news n',
      where.join(' '),
      params,
      req.query.page,
      req.query.page_size,
      ' ORDER BY n.publish_time DESC, n.id DESC'
    );
    res.json(data);
  } catch (e) { next(e); }
});

router.get('/news/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT n.*, c.name AS category_name FROM news n LEFT JOIN news_category c ON c.id = n.category_id WHERE n.id = ? AND n.status = 1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: '新闻不存在' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.get('/ads/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT a.* FROM ads a
       WHERE a.id = ? AND a.status = 1
       AND (a.start_time IS NULL OR a.start_time <= NOW())
       AND (a.end_time IS NULL OR a.end_time >= NOW())`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: '广告不存在或已下线' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.get('/ads', async (req, res, next) => {
  try {
    const position = req.query.position || 'home_banner';
    const [rows] = await db.query(
      `SELECT a.* FROM ads a
       LEFT JOIN ads_position p ON p.id = a.position_id
       WHERE a.status = 1 AND p.code = ?
       AND (a.start_time IS NULL OR a.start_time <= NOW())
       AND (a.end_time IS NULL OR a.end_time >= NOW())
       ORDER BY a.sort ASC, a.id DESC`,
      [position]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/experts/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM expert WHERE id = ? AND status = 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: '专家不存在' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.get('/experts', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM expert WHERE status = 1 ORDER BY sort ASC, id DESC');
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/mining-financing/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT mf.*, mc.name AS category_name FROM mining_financing mf LEFT JOIN mining_category mc ON mc.id = mf.category_id WHERE mf.id = ? AND mf.status = 1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: '融资项目不存在' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.get('/mining-financing', async (req, res, next) => {
  try {
    const where = ['WHERE mf.status = 1'];
    const params = [];
    if (req.query.category_id) { where.push('AND mf.category_id = ?'); params.push(req.query.category_id); }
    if (req.query.province) { where.push('AND mf.province = ?'); params.push(req.query.province); }
    if (req.query.city) { where.push('AND mf.city = ?'); params.push(req.query.city); }
    if (req.query.keyword) {
      where.push('AND (mf.title LIKE ? OR mf.summary LIKE ? OR mf.detail LIKE ?)');
      const k = `%${req.query.keyword}%`;
      params.push(k, k, k);
    }

    let orderSql = ' ORDER BY mf.publish_time DESC, mf.id DESC';
    if (req.query.sort === 'price_asc') orderSql = ' ORDER BY mf.price_ref ASC, mf.id DESC';
    if (req.query.sort === 'price_desc') orderSql = ' ORDER BY mf.price_ref DESC, mf.id DESC';

    const data = await buildListResult(
      'SELECT mf.*, mc.name AS category_name FROM mining_financing mf LEFT JOIN mining_category mc ON mc.id = mf.category_id',
      'FROM mining_financing mf',
      where.join(' '),
      params,
      req.query.page,
      req.query.page_size,
      orderSql
    );
    res.json(data);
  } catch (e) { next(e); }
});

router.get('/albums/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM album WHERE id = ? AND status = 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: '相册不存在' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.get('/albums', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM album WHERE status = 1 ORDER BY sort ASC, id DESC');
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM product WHERE id = ? AND status = 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: '产品不存在' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.get('/products', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM product WHERE status = 1 ORDER BY sort ASC, id DESC');
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/messages', async (req, res, next) => {
  try {
    const { name, phone, email, content } = req.body;
    if (!name || !content) return res.status(400).json({ message: '姓名和内容必填' });
    const hit = await ensureNoForbiddenWords([name, phone, email, content]);
    if (hit) return res.status(400).json({ message: '内容违规，请修改后提交' });
    await db.query(
      'INSERT INTO message_feedback (name, phone, email, content, status, created_at, updated_at) VALUES (?, ?, ?, ?, 0, NOW(), NOW())',
      [name, phone || null, email || null, content]
    );
    res.json({ message: '提交成功' });
  } catch (e) { next(e); }
});

router.post('/mining-inquiries', async (req, res, next) => {
  try {
    const { financing_id, name, phone, content } = req.body;
    if (!financing_id) return res.status(400).json({ message: '项目必填' });

    let finalName = name;
    let finalPhone = phone;
    let userId = null;
    const rawToken = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (rawToken) {
      try {
        const payload = jwt.verify(rawToken, jwtSecret);
        if (payload.role === 'user') {
          userId = payload.id;
          if (!finalName || !finalPhone) {
            const [users] = await db.query('SELECT real_name, phone, status FROM end_user WHERE id = ? LIMIT 1', [userId]);
            const user = users[0];
            if (!user || user.status !== 1) return res.status(403).json({ message: '账号不可用，请重新登录' });
            finalName = finalName || user.real_name;
            finalPhone = finalPhone || user.phone;
          }
        }
      } catch (_) { /* anonymous submission is fine */ }
    }

    if (!finalName || !finalPhone) return res.status(400).json({ message: '姓名、电话必填' });
    const hit = await ensureNoForbiddenWords([finalName, finalPhone, content]);
    if (hit) return res.status(400).json({ message: '内容违规，请修改后提交' });

    await db.query(
      'INSERT INTO mining_inquiry (financing_id, user_id, name, phone, content, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())',
      [financing_id, userId, finalName, finalPhone, content || null]
    );
    res.json({ message: '提交成功' });
  } catch (e) { next(e); }
});

module.exports = router;
