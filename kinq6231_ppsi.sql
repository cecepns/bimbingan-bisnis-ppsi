-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 13 Jul 2026 pada 14.41
-- Versi server: 10.11.18-MariaDB-cll-lve
-- Versi PHP: 8.4.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kinq6231_ppsi`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `materials`
--

CREATE TABLE `materials` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `youtube_url` varchar(500) DEFAULT NULL,
  `file_attachment` varchar(255) DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT 0,
  `duration_seconds` int(11) DEFAULT 0,
  `order_index` int(11) DEFAULT 0,
  `status` enum('publish','draft') DEFAULT 'draft',
  `view_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `materials`
--

INSERT INTO `materials` (`id`, `title`, `description`, `content`, `thumbnail`, `cover_image`, `youtube_url`, `file_attachment`, `duration_minutes`, `duration_seconds`, `order_index`, `status`, `view_count`, `created_at`, `updated_at`) VALUES
(1, 'Pengenalan Bimbingan Bisnis', 'Materi pertama untuk memulai perjalanan belajar bisnis Anda.', '<h2>Selamat Datang!</h2><p>Ini adalah materi pertama dalam program Bimbingan Bisnis kami. Anda akan mempelajari dasar-dasar memulai bisnis yang sukses.</p>', NULL, NULL, NULL, NULL, 10, 600, 1, 'publish', 10, '2026-07-10 08:24:42', '2026-07-10 11:43:27'),
(2, 'Riset Pasar dan Target Customer', 'Pelajari cara melakukan riset pasar yang efektif untuk bisnis Anda.', '<h2>Riset Pasar</h2><p>Memahami target customer adalah kunci kesuksesan bisnis Anda.</p>', NULL, NULL, NULL, NULL, 15, 900, 2, 'publish', 0, '2026-07-10 08:24:42', '2026-07-10 08:24:42'),
(3, 'Membangun Brand Identity', 'Cara membangun identitas brand yang kuat dan berkesan.', '<h2>Brand Identity</h2><p>Brand bukan hanya logo, tetapi keseluruhan pengalaman customer dengan bisnis Anda.</p>', NULL, NULL, NULL, NULL, 20, 1200, 3, 'publish', 0, '2026-07-10 08:24:42', '2026-07-10 08:24:42'),
(6, 'Pengenalan Bimbingan Bisnis (Copy)', 'Materi pertama untuk memulai perjalanan belajar bisnis Anda.', '<h2>Selamat Datang!</h2><p>Ini adalah materi pertama dalam program Bimbingan Bisnis kami. Anda akan mempelajari dasar-dasar memulai bisnis yang sukses.</p>', NULL, NULL, NULL, NULL, 10, 600, 4, 'draft', 0, '2026-07-11 21:05:09', '2026-07-11 21:05:09');

-- --------------------------------------------------------

--
-- Struktur dari tabel `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `whatsapp` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('admin','member') DEFAULT 'member',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `whatsapp`, `password`, `avatar`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'Administrator', 'admin@lmsbisnis.com', '081234567890', '$2a$12$vY4kOjsOfmF1a3mMZ67XBe3JFuFH0AAGluV0B3IumEl2BDKbpL/.a', NULL, 'admin', 1, '2026-07-13 14:34:15', '2026-07-10 08:24:42', '2026-07-13 07:34:15'),
(2, 'Cecep Nandang', 'cecepns29@gmail.com', '082214094779', '$2a$10$ThLTsiqJ4qx3DVkt2yz8E.h0jruouUER1caWcB6UcsSB80gjktwGy', NULL, 'member', 1, '2026-07-13 14:35:37', '2026-07-10 11:21:22', '2026-07-13 07:35:37'),
(3, 'Cepi', 'cecepns0429@gmail.com', '085720799113', '$2a$10$Y3rc3TAvXb7rP0zdVJhG/elDefBCKFxw/e.xANslNNNascG1gpDeG', NULL, 'member', 1, NULL, '2026-07-13 07:35:22', '2026-07-13 07:35:22');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_progress`
--

CREATE TABLE `user_progress` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `status` enum('locked','available','in_progress','completed') DEFAULT 'locked',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `time_spent` int(11) DEFAULT 0 COMMENT 'total seconds spent',
  `device` varchar(100) DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `user_progress`
--

INSERT INTO `user_progress` (`id`, `user_id`, `material_id`, `status`, `start_time`, `end_time`, `time_spent`, `device`, `browser`, `ip_address`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'in_progress', '2026-07-10 18:28:08', NULL, 0, NULL, NULL, NULL, '2026-07-10 11:21:22', '2026-07-10 11:28:08'),
(2, 2, 2, 'locked', NULL, NULL, 0, NULL, NULL, NULL, '2026-07-10 11:21:22', '2026-07-10 11:21:22'),
(3, 2, 3, 'locked', NULL, NULL, 0, NULL, NULL, NULL, '2026-07-10 11:21:22', '2026-07-10 11:21:22'),
(4, 3, 1, 'available', NULL, NULL, 0, NULL, NULL, NULL, '2026-07-13 07:35:22', '2026-07-13 07:35:22'),
(5, 3, 2, 'locked', NULL, NULL, 0, NULL, NULL, NULL, '2026-07-13 07:35:22', '2026-07-13 07:35:22'),
(6, 3, 3, 'locked', NULL, NULL, 0, NULL, NULL, NULL, '2026-07-13 07:35:22', '2026-07-13 07:35:22');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeks untuk tabel `user_progress`
--
ALTER TABLE `user_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_material` (`user_id`,`material_id`),
  ADD KEY `material_id` (`material_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `materials`
--
ALTER TABLE `materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `user_progress`
--
ALTER TABLE `user_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `user_progress`
--
ALTER TABLE `user_progress`
  ADD CONSTRAINT `user_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_progress_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
