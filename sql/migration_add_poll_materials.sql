-- ==========================================================
-- Migration: Add Poll Materials (Relasi Polling & Materi)
-- Tanggal: 2026-11-24
-- Deskripsi: Menambahkan tabel penghubung antara polling dan materi
--            sehingga polling dapat dimunculkan di materi tertentu.
-- ==========================================================

USE lms_bisnis;

-- 1. Buat tabel relasi poll_materials
CREATE TABLE IF NOT EXISTS poll_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    material_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_poll_material (poll_id, material_id),
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
);

-- 2. Tautkan polling ID 1 (Peluang Bisnis P2C) ke seluruh materi yang ada
--    (hanya dijalankan jika polling ID 1 ada di database)
INSERT IGNORE INTO poll_materials (poll_id, material_id)
SELECT 1, id FROM materials WHERE EXISTS (SELECT 1 FROM polls WHERE id = 1);
