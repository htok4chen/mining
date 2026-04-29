const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret === 'change-me') {
  throw new Error('JWT_SECRET 未配置或仍为默认值，请在环境变量中设置安全密钥。');
}

module.exports = { jwtSecret };
