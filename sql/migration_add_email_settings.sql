-- ============================================================
-- Migration: Add Email Settings & Password Resets Tables
-- LMS Bisnis - Bimbingan PPSI
-- ============================================================

USE lms_bisnis;

-- 1. Create password_resets table if not exists
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Create email_settings table if not exists
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Insert or update default credentials
INSERT INTO email_settings (id, smtp_host, smtp_port, smtp_secure, smtp_user, app_password, sender_name, sender_email)
VALUES (1, 'smtp.gmail.com', 465, TRUE, 'sampurdi@gmail.com', 'igfm raoe ovlj qsjm', 'LMS Bisnis', 'sampurdi@gmail.com')
ON DUPLICATE KEY UPDATE 
    smtp_user = VALUES(smtp_user),
    app_password = VALUES(app_password),
    sender_email = VALUES(sender_email);

