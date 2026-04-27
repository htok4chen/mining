require('dotenv').config();

const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const db = require('./services/db');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
require('./config/security');

const app = express();
const port = Number(process.env.PORT || 9008);
const webRoot = path.join(__dirname, '..', 'web');
const uploadsRoot = path.join(__dirname, '..', 'uploads');
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '请求过于频繁，请稍后再试' }
});

if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);
app.use('/api/admin/login', loginLimiter);
app.use('/api/public/auth/login', loginLimiter);

app.use('/uploads', express.static(uploadsRoot));
app.use('/api/public/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/admin', express.static(path.join(webRoot, 'admin')));
app.use('/', express.static(webRoot));

app.get('/api/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ status: 'db_error', message: e.message });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: '服务器错误', error: process.env.NODE_ENV === 'production' ? undefined : err.message });
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
