-- ============================================
-- Migration: Add Polling Feature (Fitur Polling)
-- ============================================

USE lms_bisnis;

-- 1. Create polls table
CREATE TABLE IF NOT EXISTS polls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) DEFAULT 'Polling',
    question TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Create poll_options table (up to 9 options per poll)
CREATE TABLE IF NOT EXISTS poll_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

-- 3. Create poll_votes table (1 vote per user per poll)
CREATE TABLE IF NOT EXISTS poll_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    option_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_poll_user (poll_id, user_id),
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Sample Poll from Client Request
INSERT INTO polls (id, title, question, description, status) VALUES
(1, 'Peluang Bisnis P2C', 'Apakah Anda tertarik menjadikan aktivitas belanja sehari-hari sebagai peluang bisnis melalui konsep P2C?', 'Suara dan pendapat Anda sangat penting untuk pengembangan program ke depan.', 'active')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO poll_options (id, poll_id, option_text, order_index) VALUES
(1, 1, 'Ya, saya tertarik!', 1),
(2, 1, 'Ingin tahu lebih banyak.', 2),
(3, 1, 'Menarik, tetapi belum siap.', 3),
(4, 1, 'Belum tertarik.', 4)
ON DUPLICATE KEY UPDATE id = id;
