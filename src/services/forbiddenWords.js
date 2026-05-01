const db = require('./db');

const normalize = (v) => String(v == null ? '' : v).trim();

const containsForbiddenWord = (text, words) => {
  const content = normalize(text).toLowerCase();
  if (!content) return null;
  for (const w of words) {
    const word = normalize(w).toLowerCase();
    if (!word) continue;
    if (content.includes(word)) return w;
  }
  return null;
};

const ensureNoForbiddenWords = async (values) => {
  const [rows] = await db.query('SELECT word FROM forbidden_word WHERE status = 1 ORDER BY sort ASC, id DESC');
  if (!rows.length) return null;
  const words = rows.map((r) => normalize(r.word)).filter(Boolean);
  if (!words.length) return null;
  for (const v of values || []) {
    const hit = containsForbiddenWord(v, words);
    if (hit) return hit;
  }
  return null;
};

module.exports = { ensureNoForbiddenWords };
