-- ============================================
-- LMS Bisnis - Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS lms_bisnis;
USE lms_bisnis;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    whatsapp VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    role ENUM('admin', 'member') DEFAULT 'member',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    content LONGTEXT DEFAULT NULL,
    thumbnail VARCHAR(255) DEFAULT NULL,
    cover_image VARCHAR(255) DEFAULT NULL,
    youtube_url VARCHAR(500) DEFAULT NULL,
    file_attachment VARCHAR(255) DEFAULT NULL,
    duration_minutes INT DEFAULT 0,
    duration_seconds INT DEFAULT 0,
    order_index INT DEFAULT 0,
    status ENUM('publish', 'draft') DEFAULT 'draft',
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    material_id INT NOT NULL,
    status ENUM('locked', 'available', 'in_progress', 'completed') DEFAULT 'locked',
    start_time DATETIME DEFAULT NULL,
    end_time DATETIME DEFAULT NULL,
    time_spent INT DEFAULT 0 COMMENT 'total seconds spent',
    device VARCHAR(100) DEFAULT NULL,
    browser VARCHAR(100) DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_material (user_id, material_id)
);

-- Password Resets table
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Settings table
CREATE TABLE IF NOT EXISTS email_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    smtp_host VARCHAR(255) DEFAULT 'smtp.gmail.com',
    smtp_port INT DEFAULT 465,
    smtp_secure BOOLEAN DEFAULT TRUE,
    smtp_user VARCHAR(255) DEFAULT '',
    app_password VARCHAR(255) DEFAULT '',
    sender_name VARCHAR(255) DEFAULT 'LMS Bisnis',
    sender_email VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default email settings row
INSERT INTO email_settings (id, smtp_host, smtp_port, smtp_secure, smtp_user, app_password, sender_name, sender_email)
VALUES (1, 'smtp.gmail.com', 465, TRUE, 'sampurdi@gmail.com', 'igfm raoe ovlj qsjm', 'LMS Bisnis', 'sampurdi@gmail.com')
ON DUPLICATE KEY UPDATE id = id;


-- ============================================

-- Sample Data
-- ============================================

-- Default Admin (password: admin123)
INSERT INTO users (name, email, whatsapp, password, role) VALUES
('Administrator', 'admin@lmsbisnis.com', '081234567890', '$2b$10$5YMnGbgUz0H8bEAWPgXdj.v5TKlD1YcA4lOCAa9dxhQ8jYQW6BG/S', 'admin')
ON DUPLICATE KEY UPDATE id = id;

-- Sample Member User (password: cecep123)
INSERT INTO users (name, email, whatsapp, password, role) VALUES
('Member Demo', 'cecepns29@gmail.com', '081234567891', '$2a$10$.zXBVmkZ4RvvSdBVJwFOtOQf4VI.hrfyqZGtNZb9w43PhaJyrv7D.', 'member')
ON DUPLICATE KEY UPDATE id = id;

-- Sample Materials
INSERT INTO materials (title, description, content, duration_minutes, order_index, status) VALUES
('Pengenalan Bimbingan Bisnis', 'Materi pertama untuk memulai perjalanan belajar bisnis Anda.', '<h2>Selamat Datang!</h2><p>Ini adalah materi pertama dalam program Bimbingan Bisnis kami. Anda akan mempelajari dasar-dasar memulai bisnis yang sukses.</p>', 10, 1, 'publish'),
('Riset Pasar dan Target Customer', 'Pelajari cara melakukan riset pasar yang efektif untuk bisnis Anda.', '<h2>Riset Pasar</h2><p>Memahami target customer adalah kunci kesuksesan bisnis Anda.</p>', 15, 2, 'publish'),
('Membangun Brand Identity', 'Cara membangun identitas brand yang kuat dan berkesan.', '<h2>Brand Identity</h2><p>Brand bukan hanya logo, tetapi keseluruhan pengalaman customer dengan bisnis Anda.</p>', 20, 3, 'publish')
ON DUPLICATE KEY UPDATE id = id;
