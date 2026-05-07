const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../services/db');
const { ensureNoForbiddenWords } = require('../services/forbiddenWords');
const userAuth = require('../middleware/userAuth');

const router = express.Router();
router.use(userAuth);

const quoteIdList = (ids) => ids.map(() => '?').join(',');

router.get('/profile', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT id, account_username, real_name, gender, title_or_position,
              email, phone, company_name, business_scope
       FROM end_user WHERE id = ?`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: '用户不存在' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.put('/profile', async (req, res, next) => {
  try {
    const payload = {};
    ['real_name', 'title_or_position', 'email', 'phone', 'company_name', 'business_scope']
      .forEach((k) => { if (req.body[k] !== undefined) payload[k] = String(req.body[k]).trim(); });
    if (!Object.keys(payload).length) return res.status(400).json({ message: '无有效字段' });
    if (!payload.real_name || !payload.title_or_position || !payload.email || !payload.phone || !payload.company_name) {
      return res.status(400).json({ message: '姓名、职务、邮箱、手机、单位不能为空' });
    }
    const hit = await ensureNoForbiddenWords([
      payload.real_name,
      payload.title_or_position,
      payload.email,
      payload.phone,
      payload.company_name,
      payload.business_scope
    ]);
    if (hit) return res.status(400).json({ message: '内容违规，请修改后提交' });

    const [dup] = await db.query(
      'SELECT id, email, phone FROM end_user WHERE id <> ? AND (email = ? OR phone = ?) LIMIT 1',
      [req.user.id, payload.email, payload.phone]
    );
    if (dup.length) {
      if (dup[0].email === payload.email) return res.status(409).json({ message: '邮箱已被占用' });
      if (dup[0].phone === payload.phone) return res.status(409).json({ message: '手机号已被占用' });
    }

    payload.updated_at = new Date();
    await db.query('UPDATE end_user SET ? WHERE id = ?', [payload, req.user.id]);
    res.json({ message: '个人信息已更新' });
  } catch (e) { next(e); }
});

router.put('/password', async (req, res, next) => {
  try {
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) return res.status(400).json({ message: '旧密码和新密码不能为空' });
    if (String(new_password).length < 6) return res.status(400).json({ message: '新密码至少 6 位' });

    const [rows] = await db.query('SELECT id, password_hash FROM end_user WHERE id = ? LIMIT 1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: '用户不存在' });
    const ok = await bcrypt.compare(String(old_password), rows[0].password_hash || '');
    if (!ok) return res.status(400).json({ message: '旧密码不正确' });

    const password_hash = await bcrypt.hash(String(new_password), 10);
    await db.query('UPDATE end_user SET password_hash = ?, updated_at = NOW() WHERE id = ?', [password_hash, req.user.id]);
    res.json({ message: '密码修改成功' });
  } catch (e) { next(e); }
});

// ── My financing posts ──────────────────────────────────────────────────────

// GET /api/user/my-financing
router.get('/my-financing', async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(req.query.page_size || 10), 1), 100);
    const [list] = await db.query(
      `SELECT mf.*, mc.name AS category_name,
              (SELECT COUNT(*) FROM mining_inquiry mi WHERE mi.financing_id = mf.id) AS inquiry_count
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
    const hit = await ensureNoForbiddenWords([title, province, city, region_desc, summary, detail]);
    if (hit) return res.status(400).json({ message: '内容违规，请修改后提交' });
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
    const hit = await ensureNoForbiddenWords([
      payload.title,
      payload.province,
      payload.city,
      payload.region_desc,
      payload.summary,
      payload.detail
    ]);
    if (hit) return res.status(400).json({ message: '内容违规，请修改后提交' });
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
    const unreadIds = list.filter((r) => !r.owner_read_at).map((r) => r.id);
    if (unreadIds.length) {
      await db.query(
        `UPDATE mining_inquiry SET owner_read_at = NOW(), updated_at = NOW()
         WHERE id IN (${quoteIdList(unreadIds)}) AND owner_read_at IS NULL`,
        unreadIds
      );
      const [readRows] = await db.query(
        `SELECT id, owner_read_at FROM mining_inquiry WHERE id IN (${quoteIdList(unreadIds)})`,
        unreadIds
      );
      const readMap = new Map(readRows.map((r) => [Number(r.id), r.owner_read_at]));
      list.forEach((row) => { if (!row.owner_read_at) row.owner_read_at = readMap.get(Number(row.id)) || row.owner_read_at; });
    }
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
    const unreadIds = list.filter((r) => !r.owner_read_at).map((r) => r.id);
    if (unreadIds.length) {
      await db.query(
        `UPDATE mining_inquiry SET owner_read_at = NOW(), updated_at = NOW()
         WHERE id IN (${quoteIdList(unreadIds)}) AND owner_read_at IS NULL`,
        unreadIds
      );
      const [readRows] = await db.query(
        `SELECT id, owner_read_at FROM mining_inquiry WHERE id IN (${quoteIdList(unreadIds)})`,
        unreadIds
      );
      const readMap = new Map(readRows.map((r) => [Number(r.id), r.owner_read_at]));
      list.forEach((row) => { if (!row.owner_read_at) row.owner_read_at = readMap.get(Number(row.id)) || row.owner_read_at; });
    }
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

// PUT /api/user/received-inquiries/:id/reply
router.put('/received-inquiries/:id/reply', async (req, res, next) => {
  try {
    const reply = String(req.body.reply || '').trim();
    if (!reply) return res.status(400).json({ message: '回复内容不能为空' });
    const hit = await ensureNoForbiddenWords([reply]);
    if (hit) return res.status(400).json({ message: '内容违规，请修改后提交' });

    const [rows] = await db.query(
      `SELECT i.id
       FROM mining_inquiry i
       JOIN mining_financing mf ON mf.id = i.financing_id
       WHERE i.id = ? AND mf.user_id = ?
       LIMIT 1`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: '洽谈记录不存在或无权限' });

    await db.query(
      `UPDATE mining_inquiry
       SET reply = ?, status = 1, owner_read_at = IFNULL(owner_read_at, NOW()), sender_read_at = NULL, updated_at = NOW()
       WHERE id = ?`,
      [reply, req.params.id]
    );
    res.json({ message: '回复成功' });
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
    const unreadReplyIds = list.filter((r) => r.reply && !r.sender_read_at).map((r) => r.id);
    if (unreadReplyIds.length) {
      await db.query(
        `UPDATE mining_inquiry SET sender_read_at = NOW(), updated_at = NOW()
         WHERE id IN (${quoteIdList(unreadReplyIds)}) AND sender_read_at IS NULL`,
        unreadReplyIds
      );
      const [readRows] = await db.query(
        `SELECT id, sender_read_at FROM mining_inquiry WHERE id IN (${quoteIdList(unreadReplyIds)})`,
        unreadReplyIds
      );
      const readMap = new Map(readRows.map((r) => [Number(r.id), r.sender_read_at]));
      list.forEach((row) => { if (row.reply && !row.sender_read_at) row.sender_read_at = readMap.get(Number(row.id)) || row.sender_read_at; });
    }
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM mining_inquiry WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ list, total, page, pageSize });
  } catch (e) { next(e); }
});

module.exports = router;
