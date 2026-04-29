const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../services/db');
const { jwtSecret } = require('../config/security');

const router = express.Router();
const DUMMY_BCRYPT_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8x8zY4xXHzkwmo7aX6ixkmKuuNHYsW';

// POST /register
router.post('/register', async (req, res, next) => {
  try {
    const {
      account_username, password,
      real_name, gender, title_or_position,
      email, phone,
      landline_country_code, landline_area_code, landline_number,
      fax_country_code, fax_area_code, fax_number,
      company_name, business_scope
    } = req.body;

    if (!account_username || !password || !real_name || !title_or_position || !email || !phone || !company_name) {
      return res.status(400).json({ message: '请填写所有必填项' });
    }
    if (account_username.length < 3 || account_username.length > 50) {
      return res.status(400).json({ message: '用户名长度须为 3-50 个字符' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: '密码不得少于 6 位' });
    }
    const emailParts = email.split('@');
    if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1].includes('.') || !emailParts[1].split('.').pop()) {
      return res.status(400).json({ message: '邮箱格式不正确' });
    }

    const [dupRows] = await db.query(
      'SELECT account_username, email, phone FROM end_user WHERE account_username = ? OR email = ? OR phone = ? LIMIT 3',
      [account_username, email, phone]
    );
    for (const row of dupRows) {
      if (row.account_username === account_username) return res.status(409).json({ message: '用户名已被注册' });
      if (row.email === email) return res.status(409).json({ message: '邮箱已被注册' });
      if (row.phone === phone) return res.status(409).json({ message: '手机号已被注册' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO end_user
         (account_username, password_hash, real_name, gender, title_or_position,
          email, phone, landline_country_code, landline_area_code, landline_number,
          fax_country_code, fax_area_code, fax_number, company_name, business_scope,
          status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        account_username, password_hash, real_name, gender || '未设置', title_or_position,
        email, phone,
        landline_country_code || null, landline_area_code || null, landline_number || null,
        fax_country_code || null, fax_area_code || null, fax_number || null,
        company_name, business_scope || null
      ]
    );
    res.json({ message: '注册成功', id: result.insertId });
  } catch (e) { next(e); }
});

// POST /login
router.post('/login', async (req, res, next) => {
  try {
    const { account_username, password } = req.body;
    if (!account_username || !password) return res.status(400).json({ message: '请输入用户名和密码' });

    const [rows] = await db.query(
      'SELECT id, account_username, password_hash, real_name, status FROM end_user WHERE account_username = ? LIMIT 1',
      [account_username]
    );
    const user = rows[0];
    const passwordHash = user ? (user.password_hash || '') : '';
    const hashForCompare = passwordHash.startsWith('$2') ? passwordHash : DUMMY_BCRYPT_HASH;
    const passwordOk = await bcrypt.compare(password, hashForCompare);

    if (!user || user.status !== 1 || !passwordOk) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, account_username: user.account_username, role: 'user' },
      jwtSecret,
      { expiresIn: '12h' }
    );
    res.json({ token, account_username: user.account_username, real_name: user.real_name });
  } catch (e) { next(e); }
});

// GET /me
router.get('/me', async (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: '未登录' });
  try {
    const payload = jwt.verify(token, jwtSecret);
    if (payload.role !== 'user') return res.status(403).json({ message: '权限不足' });
    const [rows] = await db.query(
      `SELECT id, account_username, real_name, gender, title_or_position,
              email, phone, company_name, business_scope, status, created_at
       FROM end_user WHERE id = ?`,
      [payload.id]
    );
    if (!rows.length) return res.status(404).json({ message: '用户不存在' });
    if (rows[0].status !== 1) return res.status(403).json({ message: '账号已被禁用' });
    res.json(rows[0]);
  } catch (e) {
    if (e && (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError' || e.name === 'NotBeforeError')) {
      return res.status(401).json({ message: '登录已过期，请重新登录' });
    }
    next(e);
  }
});

// POST /logout (token is client-side; server acknowledges)
router.post('/logout', (_req, res) => {
  res.json({ message: '已退出登录' });
});

module.exports = router;
