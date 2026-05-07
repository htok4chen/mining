CREATE DATABASE IF NOT EXISTS mining DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mining;

CREATE TABLE IF NOT EXISTS admin_user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news_category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  sort INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NULL,
  title VARCHAR(255) NOT NULL,
  summary VARCHAR(500) NULL,
  content TEXT NULL,
  cover_image VARCHAR(255) NULL,
  publish_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TINYINT NOT NULL DEFAULT 1,
  sort INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_news_category (category_id)
);

CREATE TABLE IF NOT EXISTS ads_position (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  status TINYINT NOT NULL DEFAULT 1,
  sort INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  position_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  link_url VARCHAR(255) NULL,
  start_time DATETIME NULL,
  end_time DATETIME NULL,
  status TINYINT NOT NULL DEFAULT 1,
  sort INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_ads_position (position_id)
);

CREATE TABLE IF NOT EXISTS expert (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  avatar VARCHAR(255) NULL,
  card_image VARCHAR(255) NULL,
  intro VARCHAR(500) NULL,
  resume TEXT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  sort INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mining_category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  sort INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mining_financing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  category_id INT NULL,
  title VARCHAR(255) NOT NULL,
  province VARCHAR(50) NULL,
  city VARCHAR(50) NULL,
  region_desc VARCHAR(255) NULL,
  price_ref DECIMAL(12,2) NULL,
  summary VARCHAR(500) NULL,
  detail TEXT NULL,
  publish_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TINYINT NOT NULL DEFAULT 1,
  sort INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_mining_category (category_id),
  KEY idx_mining_user (user_id)
);

CREATE TABLE IF NOT EXISTS mining_inquiry (
  id INT AUTO_INCREMENT PRIMARY KEY,
  financing_id INT NOT NULL,
  user_id INT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  content VARCHAR(500) NULL,
  reply VARCHAR(500) NULL,
  status TINYINT NOT NULL DEFAULT 0,
  owner_read_at DATETIME NULL,
  sender_read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_inquiry_financing (financing_id),
  KEY idx_inquiry_user (user_id)
);

CREATE TABLE IF NOT EXISTS product (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  cover_image VARCHAR(255) NULL,
  description VARCHAR(500) NULL,
  status TINYINT NOT NULL DEFAULT 1,
  sort INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS album (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  description VARCHAR(500) NULL,
  status TINYINT NOT NULL DEFAULT 1,
  sort INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS message_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NULL,
  email VARCHAR(100) NULL,
  content VARCHAR(1000) NOT NULL,
  reply VARCHAR(500) NULL,
  status TINYINT NOT NULL DEFAULT 0,
  sort INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forbidden_word (
  id INT AUTO_INCREMENT PRIMARY KEY,
  word VARCHAR(100) NOT NULL UNIQUE,
  remark VARCHAR(255) NULL,
  status TINYINT NOT NULL DEFAULT 1,
  sort INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO admin_user (username, password_hash, status)
SELECT 'admin', '$2a$10$g.TSLuiCncXGLuBlKVWEMusXnDvTZuq4yKonrE8nx0OlufJTvfGUW', 1
WHERE NOT EXISTS (SELECT 1 FROM admin_user WHERE username = 'admin');

UPDATE admin_user
SET password_hash = '$2a$10$g.TSLuiCncXGLuBlKVWEMusXnDvTZuq4yKonrE8nx0OlufJTvfGUW'
WHERE username = 'admin' AND password_hash NOT LIKE '$2%';

INSERT INTO news_category (name, sort, status)
SELECT '行业动态', 1, 1 WHERE NOT EXISTS (SELECT 1 FROM news_category WHERE name='行业动态');
INSERT INTO news_category (name, sort, status)
SELECT '政策解读', 2, 1 WHERE NOT EXISTS (SELECT 1 FROM news_category WHERE name='政策解读');

INSERT INTO news (category_id, title, summary, content, publish_time, status, sort)
SELECT 1, '矿业信息服务平台上线', '平台正式上线，提供行业资讯与融资信息服务。', '矿业信息服务平台正式上线，欢迎访问。', NOW(), 1, 1
WHERE NOT EXISTS (SELECT 1 FROM news WHERE title='矿业信息服务平台上线');
INSERT INTO news (category_id, title, summary, content, publish_time, status, sort)
SELECT 2, '绿色矿山政策持续推进', '围绕绿色矿山建设，政策持续加码。', '政策详情请关注后续解读。', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, 2
WHERE NOT EXISTS (SELECT 1 FROM news WHERE title='绿色矿山政策持续推进');

INSERT INTO ads_position (name, code, status, sort)
SELECT '首页主轮播', 'home_banner', 1, 1 WHERE NOT EXISTS (SELECT 1 FROM ads_position WHERE code='home_banner');
INSERT INTO ads_position (name, code, status, sort)
SELECT '首页中部横幅', 'home_middle', 1, 2 WHERE NOT EXISTS (SELECT 1 FROM ads_position WHERE code='home_middle');
INSERT INTO ads_position (name, code, status, sort)
SELECT '首页分块广告', 'home_tiles', 1, 3 WHERE NOT EXISTS (SELECT 1 FROM ads_position WHERE code='home_tiles');

INSERT INTO ads (position_id, title, image_url, link_url, status, sort)
SELECT (SELECT id FROM ads_position WHERE code='home_banner' LIMIT 1), '主轮播广告1', 'https://picsum.photos/1200/300?random=12', '#', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM ads WHERE title='主轮播广告1');
INSERT INTO ads (position_id, title, image_url, link_url, status, sort)
SELECT (SELECT id FROM ads_position WHERE code='home_banner' LIMIT 1), '主轮播广告2', 'https://picsum.photos/1200/300?random=14', '#', 1, 2
WHERE NOT EXISTS (SELECT 1 FROM ads WHERE title='主轮播广告2');
INSERT INTO ads (position_id, title, image_url, link_url, status, sort)
SELECT (SELECT id FROM ads_position WHERE code='home_middle' LIMIT 1), '中部横幅', 'https://picsum.photos/1200/160?random=15', '#', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM ads WHERE title='中部横幅');
INSERT INTO ads (position_id, title, image_url, link_url, status, sort)
SELECT (SELECT id FROM ads_position WHERE code='home_tiles' LIMIT 1), '分块广告1', 'https://picsum.photos/420/220?random=41', '#', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM ads WHERE title='分块广告1');
INSERT INTO ads (position_id, title, image_url, link_url, status, sort)
SELECT (SELECT id FROM ads_position WHERE code='home_tiles' LIMIT 1), '分块广告2', 'https://picsum.photos/220/110?random=42', '#', 1, 2
WHERE NOT EXISTS (SELECT 1 FROM ads WHERE title='分块广告2');
INSERT INTO ads (position_id, title, image_url, link_url, status, sort)
SELECT (SELECT id FROM ads_position WHERE code='home_tiles' LIMIT 1), '分块广告3', 'https://picsum.photos/220/110?random=43', '#', 1, 3
WHERE NOT EXISTS (SELECT 1 FROM ads WHERE title='分块广告3');
INSERT INTO ads (position_id, title, image_url, link_url, status, sort)
SELECT (SELECT id FROM ads_position WHERE code='home_tiles' LIMIT 1), '分块广告4', 'https://picsum.photos/220/110?random=44', '#', 1, 4
WHERE NOT EXISTS (SELECT 1 FROM ads WHERE title='分块广告4');
INSERT INTO ads (position_id, title, image_url, link_url, status, sort)
SELECT (SELECT id FROM ads_position WHERE code='home_tiles' LIMIT 1), '分块广告5', 'https://picsum.photos/220/110?random=45', '#', 1, 5
WHERE NOT EXISTS (SELECT 1 FROM ads WHERE title='分块广告5');
INSERT INTO ads (position_id, title, image_url, link_url, status, sort)
SELECT (SELECT id FROM ads_position WHERE code='home_tiles' LIMIT 1), '分块广告6', 'https://picsum.photos/220/110?random=46', '#', 1, 6
WHERE NOT EXISTS (SELECT 1 FROM ads WHERE title='分块广告6');

INSERT INTO expert (name, avatar, card_image, intro, resume, status, sort)
SELECT '张建国', 'https://picsum.photos/80/80?random=1', 'https://picsum.photos/560/320?random=61', '矿权评估专家', '从业20年，参与多项大型矿产项目评估。', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM expert WHERE name='张建国');
INSERT INTO expert (name, avatar, card_image, intro, resume, status, sort)
SELECT '李慧敏', 'https://picsum.photos/80/80?random=2', 'https://picsum.photos/560/320?random=62', '地质勘查顾问', '专注矿产资源勘查与开发规划。', 1, 2
WHERE NOT EXISTS (SELECT 1 FROM expert WHERE name='李慧敏');

INSERT INTO mining_category (name, status, sort)
SELECT '煤矿项目', 1, 1 WHERE NOT EXISTS (SELECT 1 FROM mining_category WHERE name='煤矿项目');
INSERT INTO mining_category (name, status, sort)
SELECT '有色金属', 1, 2 WHERE NOT EXISTS (SELECT 1 FROM mining_category WHERE name='有色金属');

INSERT INTO mining_financing (category_id, title, province, city, region_desc, price_ref, summary, detail, publish_time, status, sort)
SELECT 1, '山西煤矿技改融资项目', '山西', '太原', '太原周边矿区', 2800.00, '寻求技改资金，项目稳定。', '项目手续齐全，产能稳定，欢迎洽谈。', NOW(), 1, 1
WHERE NOT EXISTS (SELECT 1 FROM mining_financing WHERE title='山西煤矿技改融资项目');
INSERT INTO mining_financing (category_id, title, province, city, region_desc, price_ref, summary, detail, publish_time, status, sort)
SELECT 2, '江西铜矿扩产融资', '江西', '上饶', '上饶工业区', 3600.00, '扩产项目融资需求。', '资源储量可靠，扩产计划明确。', DATE_SUB(NOW(), INTERVAL 2 DAY), 1, 2
WHERE NOT EXISTS (SELECT 1 FROM mining_financing WHERE title='江西铜矿扩产融资');

INSERT INTO product (name, cover_image, description, status, sort)
SELECT '矿产数据服务', 'https://picsum.photos/300/220?random=22', '为矿业企业提供数据分析服务。', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM product WHERE name='矿产数据服务');
INSERT INTO product (name, cover_image, description, status, sort)
SELECT '矿权评估服务', 'https://picsum.photos/300/220?random=23', '提供矿权价值评估与咨询方案。', 1, 2
WHERE NOT EXISTS (SELECT 1 FROM product WHERE name='矿权评估服务');

INSERT INTO album (title, image_url, description, status, sort)
SELECT '项目考察', 'https://picsum.photos/320/220?random=31', '考察现场照片', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM album WHERE title='项目考察');
INSERT INTO album (title, image_url, description, status, sort)
SELECT '企业活动', 'https://picsum.photos/320/220?random=32', '企业内部活动照片', 1, 2
WHERE NOT EXISTS (SELECT 1 FROM album WHERE title='企业活动');

INSERT INTO site_config (config_key, config_value)
SELECT 'site_name', '矿业信息服务平台' WHERE NOT EXISTS (SELECT 1 FROM site_config WHERE config_key='site_name');

CREATE TABLE IF NOT EXISTS end_user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  real_name VARCHAR(100) NOT NULL,
  gender ENUM('男','女','未设置') NOT NULL DEFAULT '未设置',
  title_or_position VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL UNIQUE,
  landline_country_code VARCHAR(10) NULL,
  landline_area_code VARCHAR(10) NULL,
  landline_number VARCHAR(30) NULL,
  fax_country_code VARCHAR(10) NULL,
  fax_area_code VARCHAR(10) NULL,
  fax_number VARCHAR(30) NULL,
  company_name VARCHAR(200) NOT NULL,
  business_scope VARCHAR(500) NULL,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Idempotent migrations for existing deployments
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mining_financing' AND COLUMN_NAME = 'user_id');
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE mining_financing ADD COLUMN user_id INT NULL AFTER id, ADD KEY idx_mining_user (user_id)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists2 = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mining_inquiry' AND COLUMN_NAME = 'user_id');
SET @sql2 = IF(@col_exists2 = 0,
  'ALTER TABLE mining_inquiry ADD COLUMN user_id INT NULL AFTER financing_id, ADD KEY idx_inquiry_user (user_id)',
  'SELECT 1');
PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

SET @col_exists3 = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'expert' AND COLUMN_NAME = 'card_image');
SET @sql3 = IF(@col_exists3 = 0,
  'ALTER TABLE expert ADD COLUMN card_image VARCHAR(255) NULL AFTER avatar',
  'SELECT 1');
PREPARE stmt3 FROM @sql3; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

SET @col_exists4 = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mining_inquiry' AND COLUMN_NAME = 'owner_read_at');
SET @sql4 = IF(@col_exists4 = 0,
  'ALTER TABLE mining_inquiry ADD COLUMN owner_read_at DATETIME NULL AFTER status',
  'SELECT 1');
PREPARE stmt4 FROM @sql4; EXECUTE stmt4; DEALLOCATE PREPARE stmt4;

SET @col_exists5 = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mining_inquiry' AND COLUMN_NAME = 'sender_read_at');
SET @sql5 = IF(@col_exists5 = 0,
  'ALTER TABLE mining_inquiry ADD COLUMN sender_read_at DATETIME NULL AFTER owner_read_at',
  'SELECT 1');
PREPARE stmt5 FROM @sql5; EXECUTE stmt5; DEALLOCATE PREPARE stmt5;
