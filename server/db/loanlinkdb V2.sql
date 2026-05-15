-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 15, 2026 at 07:54 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `loanappdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `client_request`
--

CREATE TABLE `client_request` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `state` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `client_request`
--

INSERT INTO `client_request` (`id`, `user_id`, `amount`, `reason`, `created_at`, `updated_at`, `state`) VALUES
(1, 14, 9999.00, 'Para compras', '2026-05-15 00:11:16', '2026-05-15 19:43:14', 'accepted'),
(9, 15, 1111111.00, '1111111', '2026-05-15 01:27:02', '2026-05-15 01:27:02', 'pendiente'),
(10, 17, 5000.00, 'Para comprar una casa, un prestamo hipotecario\n', '2026-05-15 19:34:40', '2026-05-15 19:34:40', 'pendiente');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `client_request`
--
ALTER TABLE `client_request`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `client_request`
--
ALTER TABLE `client_request`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `client_request`
--
ALTER TABLE `client_request`
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
