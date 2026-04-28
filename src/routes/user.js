const express = require('express');
const db = require('../services/db');
const userAuth = require('../middleware/userAuth');

const router = express.Router();
router.use(userAuth);

// ── My financing posts ──────────────────────────────────────────────────────

// GET /api/user/my-financing
router.get('/my-financing', async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(req.query.page_size || 10), 1), 100);
    const [list] = await db.query(
      `SELECT mf.*, mc.name AS category_name
       FROM mining_financing mf
       LEFT JOIN mining_category mc ON mc.id = mf.category_id
       WHERE mf.user_id = ?
       ORDER BY mf.created_at DESC
       LIMIT ?, ?`,
      [req.user.id, (page - 1) * pageSize, pageSize]
    );
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM mining_financing WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ list, total, page, pageSize });
  } catch (e) { next(e); }
});

// POST /api/user/my-financing
router.post('/my-financing', async (req, res, next) => {
  try {
    const { category_id, title, province, city, region_desc, price_ref, summary, detail } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: '标题不能为空' });
    const [result] = await db.query(
      `INSERT INTO mining_financing
         (user_id, category_id, title, province, city, region_desc, price_ref, summary, detail,
          publish_time, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1, NOW(), NOW())`,
      [
        req.user.id,
        category_id || null,
        title.trim(),
        province || null,
        city || null,
        region_desc || null,
        price_ref || null,
        summary || null,
        detail || null
      ]
    );
    res.json({ id: result.insertId, message: '发布成功' });
  } catch (e) { next(e); }
});

// GET /api/user/my-financing/:id
router.get('/my-financing/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT mf.*, mc.name AS category_name
       FROM mining_financing mf
       LEFT JOIN mining_category mc ON mc.id = mf.category_id
       WHERE mf.id = ? AND mf.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: '记录不存在或无权限' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// PUT /api/user/my-financing/:id
router.put('/my-financing/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id FROM mining_financing WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: '记录不存在或无权限' });

    const allowed = ['category_id', 'title', 'province', 'city', 'region_desc', 'price_ref', 'summary', 'detail', 'status'];
    const payload = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) payload[f] = req.body[f]; });
    if (!Object.keys(payload).length) return res.status(400).json({ message: '无有效字段' });
    if (payload.title !== undefined && !String(payload.title).trim()) {
      return res.status(400).json({ message: '标题不能为空' });
    }
    payload.updated_at = new Date();
    await db.query('UPDATE mining_financing SET ? WHERE id = ? AND user_id = ?', [payload, req.params.id, req.user.id]);
    res.json({ message: '更新成功' });
  } catch (e) { next(e); }
});

// DELETE /api/user/my-financing/:id
router.delete('/my-financing/:id', async (req, res, next) => {
  try {
    const [result] = await db.query(
      'DELETE FROM mining_financing WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: '记录不存在或无权限' });
    res.json({ message: '删除成功' });
  } catch (e) { next(e); }
});

// ── Inquiries received on my financing posts ────────────────────────────────

// GET /api/user/my-financing/:id/inquiries
router.get('/my-financing/:id/inquiries', async (req, res, next) => {
  try {
    const [posts] = await db.query(
      'SELECT id FROM mining_financing WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!posts.length) return res.status(404).json({ message: '记录不存在或无权限' });

    const page = Math.max(Number(req.query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(req.query.page_size || 20), 1), 100);
    const [list] = await db.query(
      `SELECT i.*, mf.title AS post_title
       FROM mining_inquiry i
       LEFT JOIN mining_financing mf ON mf.id = i.financing_id
       WHERE i.financing_id = ?
       ORDER BY i.created_at DESC
       LIMIT ?, ?`,
      [req.params.id, (page - 1) * pageSize, pageSize]
    );
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM mining_inquiry WHERE financing_id = ?',
      [req.params.id]
    );
    res.json({ list, total, page, pageSize });
  } catch (e) { next(e); }
});

// GET /api/user/received-inquiries  (all inquiries on all my posts)
router.get('/received-inquiries', async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(req.query.page_size || 20), 1), 100);
    const [list] = await db.query(
      `SELECT i.*, mf.title AS post_title
       FROM mining_inquiry i
       JOIN mining_financing mf ON mf.id = i.financing_id
       WHERE mf.user_id = ?
       ORDER BY i.created_at DESC
       LIMIT ?, ?`,
      [req.user.id, (page - 1) * pageSize, pageSize]
    );
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total
       FROM mining_inquiry i
       JOIN mining_financing mf ON mf.id = i.financing_id
       WHERE mf.user_id = ?`,
      [req.user.id]
    );
    res.json({ list, total, page, pageSize });
  } catch (e) { next(e); }
});

// ── My submitted inquiries ──────────────────────────────────────────────────

// GET /api/user/my-inquiries
router.get('/my-inquiries', async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(req.query.page_size || 20), 1), 100);
    const [list] = await db.query(
      `SELECT i.*, mf.title AS post_title
       FROM mining_inquiry i
       LEFT JOIN mining_financing mf ON mf.id = i.financing_id
       WHERE i.user_id = ?
       ORDER BY i.created_at DESC
       LIMIT ?, ?`,
      [req.user.id, (page - 1) * pageSize, pageSize]
    );
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM mining_inquiry WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ list, total, page, pageSize });
  } catch (e) { next(e); }
});

module.exports = router;
