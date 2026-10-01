-- ============================================================
-- Migration: Add duration_seconds to materials Table
-- LMS Bisnis - Bimbingan PPSI
-- ============================================================

-- 1. Tambahkan kolom duration_seconds ke tabel materials secara aman jika belum ada
--    (Kompatibel untuk semua versi MySQL 5.7+, MySQL 8.0+, MariaDB, dan phpMyAdmin)
SET @dbname = DATABASE();
SET @tablename = 'materials';
SET @columnname = 'duration_seconds';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `materials` ADD COLUMN `duration_seconds` INT(11) DEFAULT 0 AFTER `duration_minutes`'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Migrasi data lama: konversi nilai duration_minutes ke duration_seconds (1 menit = 60 detik)
UPDATE `materials` 
SET `duration_seconds` = COALESCE(`duration_minutes`, 0) * 60 
WHERE `duration_seconds` = 0 OR `duration_seconds` IS NULL;
