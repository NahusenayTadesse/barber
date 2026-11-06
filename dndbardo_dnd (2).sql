-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 06, 2026 at 08:59 PM
-- Server version: 10.11.19-MariaDB-cll-lve
-- PHP Version: 8.4.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dndbardo_dnd`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE `account` (
  `id` varchar(36) NOT NULL,
  `account_id` text NOT NULL,
  `provider_id` text NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `access_token` text DEFAULT NULL,
  `refresh_token` text DEFAULT NULL,
  `id_token` text DEFAULT NULL,
  `access_token_expires_at` datetime DEFAULT NULL,
  `refresh_token_expires_at` datetime DEFAULT NULL,
  `scope` text DEFAULT NULL,
  `password` text DEFAULT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`id`, `account_id`, `provider_id`, `user_id`, `access_token`, `refresh_token`, `id_token`, `access_token_expires_at`, `refresh_token_expires_at`, `scope`, `password`, `created_at`, `updated_at`) VALUES
('OeN4T9q5sMxUEoC5AtQbSB74ENIEceZL', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', 'credential', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL, NULL, NULL, NULL, NULL, NULL, '2595001425bcda6a4f3ee2e56f89bc5c:5785afae8150024ce518f265a72fb3f69dcb3a4a7524dce8d398a43baa1bedeb0d62574e2ec5fc8b4244c25ced4038b369f61e290bba99ebff83acd2927a78fd', '2026-04-05 17:56:18.632', '2026-10-06 15:16:04');

-- --------------------------------------------------------

--
-- Table structure for table `business_hours`
--

CREATE TABLE `business_hours` (
  `id` int(11) NOT NULL,
  `day_of_week` int(11) NOT NULL,
  `day_label` varchar(20) NOT NULL,
  `sort_order` int(11) NOT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT 0,
  `opens_label` varchar(20) DEFAULT NULL,
  `closes_label` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `id` int(11) NOT NULL,
  `code` varchar(32) NOT NULL,
  `enrolment_id` int(11) DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `course_details` varchar(255) DEFAULT NULL,
  `completed_on` date NOT NULL,
  `signatory_name` varchar(255) DEFAULT NULL,
  `signatory_role` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `instructor` varchar(255) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_sessions`
--

CREATE TABLE `class_sessions` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `day_of_week` int(11) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `email`, `phone`, `subject`, `message`, `is_read`, `created_at`) VALUES
(2, 'Metro', 'metro_911999@yahoo.com', '0000000000', 'Free haircut booking', 'What days and times do you give free mens haircuts and beard-trims?\n\nThank you', 0, '2026-11-02 16:49:16.123');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `level` varchar(100) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `target` varchar(255) DEFAULT NULL,
  `experience` varchar(255) DEFAULT NULL,
  `min_price` decimal(10,2) DEFAULT NULL,
  `min_price_message` varchar(255) DEFAULT NULL,
  `audience` enum('men','women') NOT NULL DEFAULT 'men',
  `featured_image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `name`, `level`, `duration`, `description`, `base_price`, `slug`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`, `target`, `experience`, `min_price`, `min_price_message`, `audience`, `featured_image`) VALUES
(13, 'Foundation Course', 'Beginner Friendly', '4 Weeks', 'Clipper & scissor techniques, classic haircuts, taper & skin fades, beard trimming & shaping, health & safety, client consultation and live client experience. Includes the D&D Barber Academy Certificate.', 1500.00, 'foundation-course', 0, NULL, 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', '2026-10-06 18:55:29', '2026-10-11 20:06:04', NULL, NULL, NULL, NULL, 'men', NULL),
(14, 'Professional Course', 'Advanced Skills', '8 Weeks', 'Everything in the Foundation Course plus advanced fading techniques, Afro & textured hair cutting, precision beard sculpting, hot towel shaving, modern barbering styles, and barber business & marketing. Includes the D&D Professional Barber Diploma.', 2300.00, 'professional-course', 0, NULL, 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', '2026-10-06 18:55:29', '2026-10-11 20:06:19', NULL, NULL, NULL, NULL, 'men', NULL),
(15, 'Master Barber Academy Diploma', 'The Complete Master Course', '12 Weeks', 'Everything in the Professional Course plus mastering all fade techniques, advanced beard sculpting, hair colouring & beard colouring, hair designs & creative patterns, men\'s & women\'s braiding, hair relaxing & texture management, business start-up & shop management, branding, marketing & career mentoring. Includes the D&D Master Barber Academy Diploma.', 3000.00, 'master-barber-academy-diploma', 1, NULL, 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', '2026-10-06 18:55:29', '2026-10-13 09:54:18', NULL, NULL, NULL, NULL, 'men', '183e4f2a-02d0-4ff1-a867-8da337c42243.webp'),
(16, 'Specialist Intensive Course', 'Specialist Training', '4 Weeks', 'Choose your specialist area: Fade Mastery, Beard Grooming & Sculpting, Hair Designs & Patterns, Hair Braiding (Men & Women), or Hair Colouring & Texture Services. Certificate of Completion.', 1500.00, 'specialist-intensive-course', 0, NULL, 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', '2026-10-06 18:55:29', '2026-10-11 20:06:28', NULL, NULL, NULL, NULL, 'men', NULL),
(17, 'International Certification Programme', 'Internationally Recognised', '12 Weeks', 'Includes the complete 12-Week Master Barber Academy Diploma plus an Internationally Recognised Qualification or NVQ (when available), including the required assessments and certification.', 4200.00, 'international-certification-programme', 0, NULL, 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', '2026-10-06 18:55:29', '2026-10-11 20:06:37', NULL, NULL, NULL, NULL, 'men', NULL),
(18, 'Women\'s Hairdressing Foundation Course', 'Beginner Friendly', '4 Weeks', 'Washing & hair care\nBlow dry & straightening basics\nBasic braiding & cornrows\nHealth & safety\nClient consultation\nLive client experience\nD&D Academy Certificate', 1500.00, 'womens-hairdressing-foundation-course', 0, NULL, NULL, '2026-10-12 19:22:18', '2026-10-12 19:22:18', NULL, NULL, 750.00, NULL, 'women', NULL),
(19, 'Women\'s Hairdressing Professional Course', 'Professional Course', '8 Weeks (3 days per week)', 'Washing & hair care\nStraightening & blow dry\nTraditional braiding\nHair treatments & styling\nD&D Academy Certificate', 2400.00, 'womens-hairdressing-professional-course', 1, NULL, 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', '2026-10-12 19:22:18', '2026-10-13 09:53:25', NULL, NULL, 1200.00, NULL, 'women', 'ea012fc8-1f47-47e5-9b11-696d78b84f50.jpg'),
(20, 'Women\'s Hairdressing Master Diploma', 'The Complete Master Course', '12 Weeks', 'Everything in the Professional Course\nBox braids, stitch braids & advanced braiding\nHair relaxing & texture management\nHair colouring\nBusiness start-up & salon management\nBranding, marketing & career mentoring\nD&D Master Academy Diploma', 3000.00, 'womens-hairdressing-master-diploma', 0, NULL, 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', '2026-10-12 19:22:18', '2026-10-13 09:42:44', NULL, NULL, 1500.00, NULL, 'women', '49e37ecf-4e7b-4d0e-83db-40fb7ad04a0e.jpeg'),
(21, 'Women\'s Specialist Intensive Course', 'Specialist Training', '4 Weeks', 'Choose your specialist area: Hair Braiding, Hair Colouring, or Texture Services\nCertificate of Completion', 1500.00, 'womens-specialist-intensive-course', 0, NULL, NULL, '2026-10-12 19:22:18', '2026-10-12 19:22:18', NULL, NULL, 750.00, NULL, 'women', NULL),
(22, 'Women\'s International Certification Programme', 'Internationally Recognised', '12 Weeks', 'The complete 12-Week Women\'s Hairdressing Master Diploma\nAn Internationally Recognised Qualification or NVQ (when available), including the required assessments and certification', 4200.00, 'womens-international-certification-programme', 0, NULL, NULL, '2026-10-12 19:22:18', '2026-10-12 19:22:18', NULL, NULL, 2100.00, NULL, 'women', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `course_discounts`
--

CREATE TABLE `course_discounts` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `starts_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_discounts`
--

INSERT INTO `course_discounts` (`id`, `name`, `percentage`, `starts_at`, `expires_at`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'Opening Day Discount', 30.00, '2026-10-07 22:00:00', '2026-11-08 23:59:59', 1, NULL, 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', '2026-10-08 17:15:10', '2026-11-01 19:10:59'),
(2, 'November Registrations', 30.00, '2026-10-11 22:00:00', '2026-11-30 23:59:59', 1, NULL, 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', '2026-10-12 19:22:18', '2026-11-01 19:10:26');

-- --------------------------------------------------------

--
-- Table structure for table `course_discount_courses`
--

CREATE TABLE `course_discount_courses` (
  `discount_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_discount_courses`
--

INSERT INTO `course_discount_courses` (`discount_id`, `course_id`) VALUES
(1, 15),
(2, 19);

-- --------------------------------------------------------

--
-- Table structure for table `course_payment_methods`
--

CREATE TABLE `course_payment_methods` (
  `course_id` int(11) NOT NULL,
  `method_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_payment_methods`
--

INSERT INTO `course_payment_methods` (`course_id`, `method_id`) VALUES
(13, 1),
(13, 2),
(13, 3),
(13, 4),
(14, 1),
(14, 2),
(14, 3),
(14, 4),
(15, 3),
(15, 4),
(16, 1),
(16, 2),
(16, 3),
(16, 4),
(17, 1),
(17, 2),
(17, 3),
(17, 4),
(18, 1),
(18, 2),
(18, 3),
(18, 4),
(19, 3),
(19, 4),
(20, 3),
(20, 4),
(21, 1),
(21, 2),
(21, 3),
(21, 4),
(22, 1),
(22, 2),
(22, 3),
(22, 4);

-- --------------------------------------------------------

--
-- Table structure for table `discount_nullifications`
--

CREATE TABLE `discount_nullifications` (
  `id` int(11) NOT NULL,
  `enrolment_id` int(11) NOT NULL,
  `discount_name` varchar(255) NOT NULL,
  `discount_percentage` decimal(5,2) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `amount_due` decimal(10,2) NOT NULL,
  `reason` text NOT NULL,
  `nullified_on` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrolments`
--

CREATE TABLE `enrolments` (
  `id` int(11) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `payment_option_id` int(11) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `status` enum('pending','confirmed','cancelled') DEFAULT 'pending',
  `created_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3),
  `course` varchar(255) DEFAULT NULL,
  `payment_option` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `discount_name` varchar(255) DEFAULT NULL,
  `discount_percentage` decimal(5,2) DEFAULT NULL,
  `stripe_session_id` varchar(255) DEFAULT NULL,
  `payment_method_id` int(11) DEFAULT NULL,
  `payment_way_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enrolments`
--

INSERT INTO `enrolments` (`id`, `course_id`, `payment_option_id`, `email`, `status`, `created_at`, `course`, `payment_option`, `first_name`, `last_name`, `phone`, `amount`, `discount_name`, `discount_percentage`, `stripe_session_id`, `payment_method_id`, `payment_way_id`, `class_id`, `notes`) VALUES
(27, 15, NULL, 'asmeretmamatey2@gmail.com', 'confirmed', '2026-10-10 14:00:42.914', 'Master Barber Academy Diploma', 'Pay in Full', 'Asmeret', 'Mulugeta', '07398644846', 1350.00, 'Opening Day Discount', 50.00, 'cs_live_a18BYiVSqPmBWOzxDt9voTiYaAjId4S1s9ZZ5JgBE5z873Oaldm8okTiWN', 3, 1, NULL, NULL),
(28, 15, NULL, 'izayonrecordslondon@gmail.com', 'confirmed', '2026-10-11 19:50:58.409', 'Master Barber Academy Diploma', 'Pay in Full', 'Semhar', 'Belay', '07438 144264', 1200.00, 'Opening Day Discount', 50.00, NULL, 3, 2, NULL, NULL),
(31, 19, NULL, 'tsegahadgembes1987@yahoo.com', 'confirmed', '2026-10-14 12:27:35.792', 'Women\'s Hairdressing Professional Course', '2 Equal Intallments', 'Tsega', 'Hadgmbes', '07490648382', 600.00, 'November Registrations', 50.00, 'cs_live_a1AjLApfGgPKI2n09NMn3FOQfPGzOV46XEIRnY89aJQu7tund1yTaTRNQ8', 4, 2, NULL, '1200£ full paid'),
(32, 15, NULL, 'salmanyasin905@gmail.com', 'confirmed', '2026-10-16 16:56:30.270', 'Master Barber Academy Diploma', '2 Equal Intallments', 'Salman', 'Yasin', '07411664464', 750.00, 'Opening Day Discount', 50.00, NULL, 4, 2, NULL, NULL),
(33, 19, NULL, 'mesiigidey@gmail.com', 'confirmed', '2026-10-17 12:11:24.921', 'Women\'s Hairdressing Professional Course', '2 Equal Intallments', 'Meseret', 'Gidey', '07384145554', 600.00, 'November Registrations', 50.00, NULL, 4, 3, NULL, NULL),
(34, 13, NULL, 'nhabte01@gmail.com', 'confirmed', '2026-10-18 16:15:04.218', 'Foundation Course', '3 Equal Instalments', 'Nahom', 'Solomon', '07415876441', 500.00, NULL, NULL, 'cs_live_a14XDXVYRzsOKve7YhTQXAir5dvXn99fffysbs9uanS02ZLlSb8EXqqo7g', 2, 1, NULL, NULL),
(36, 15, NULL, 'melatberhanu668@gmail.com', 'confirmed', '2026-10-19 16:21:40.156', 'Master Barber Academy Diploma', 'Pay in Full', 'Melat', 'Berhanu', '07466649676', 1500.00, 'Opening Day Discount', 50.00, 'cs_live_a160fRxHvoTOGRuELGyVMsRuPGEX62oSdefkVOgZOTD4XEzKkbCks2djrm', 3, 1, NULL, NULL),
(38, 19, NULL, 'hyordanos123@gmail.com', 'confirmed', '2026-10-20 13:59:01.395', 'Women\'s Hairdressing Professional Course', '2 Equal Intallments', 'yordanos', 'geretsadk', '07747876164', 600.00, 'November Registrations', 50.00, NULL, 4, 2, NULL, NULL),
(39, 15, NULL, 'abel.grande21@icloud.com', 'pending', '2026-10-21 19:23:57.264', 'Master Barber Academy Diploma', '2 Equal Intallments', 'Abel', 'Redae', '07474741827', 750.00, 'Opening Day Discount', 50.00, NULL, 4, NULL, NULL, NULL),
(40, 13, NULL, 'abelhabtom032@gmail.com', 'confirmed', '2026-10-22 12:35:24.398', 'Foundation Course', '2 Equal Intallments', 'abel', 'habtom', '07542954408', 750.00, NULL, NULL, 'cs_live_a1WqxmSlFDUF8vBsMkoYPslpbY2kaS4mBijtWDQbOtqVGYtnzlGoTeu9QY', 4, 1, NULL, NULL),
(41, 15, NULL, 'gezugebreyes@gmail.com', 'confirmed', '2026-10-22 14:21:35.677', 'Master Barber Academy Diploma', '2 Equal Intallments', 'Gezahegn', 'Balcha', '07514471521', 750.00, 'Opening Day Discount', 50.00, 'cs_live_a1ei6l42M1onaZ3kxuvvPathQ4iSVSWMDWlCOuWlp5Hees8wyLmS8sZz7F', 4, 1, NULL, NULL),
(42, 19, NULL, 'yohanatesfagber@yahoo.com', 'confirmed', '2026-10-23 10:35:12.189', 'Women\'s Hairdressing Professional Course', 'Pay in Full', 'Yohana', 'Tesfagaber', '07448031755', 1200.00, 'November Registrations', 50.00, NULL, 3, 3, NULL, NULL),
(44, 15, NULL, 'michael.mengstab@yahoo.com', 'confirmed', '2026-10-24 11:17:01.270', 'Master Barber Academy Diploma', '2 Equal Intallments', 'Michael', 'Mengstab', '07932774438', 750.00, 'Opening Day Discount', 50.00, 'cs_live_a1ab3ejcXMsv8I1YAXesv2zhjFGzCmLPt6kBoeOXdOImJ6EWwoDe9v9J5c', 4, 1, NULL, NULL),
(45, 15, NULL, 'asamenewyosef@gmail.com', 'confirmed', '2026-10-27 16:06:10.827', 'Master Barber Academy Diploma', 'Pay in Full', 'Asamenew', 'Yosef', '07539009617', 1500.00, 'Opening Day Discount', 50.00, NULL, 3, 3, NULL, NULL),
(46, 19, NULL, 'Natsinetfikdu@yahoo.com', 'confirmed', '2026-10-27 21:25:11.519', 'Women\'s Hairdressing Professional Course', '2 Equal Intallments', 'Natsinet', 'Fikadu', '07946171475', 600.00, 'November Registrations', 50.00, 'cs_live_a1edx5W0PdLEmafDFjjg6SIYn69cenQ2HoBvMrKTx4x9z5JKngXZiiz22Y', 4, 1, NULL, NULL),
(48, 19, NULL, 'senayitdejen017@gmail.com', 'confirmed', '2026-10-28 10:17:51.201', 'Women\'s Hairdressing Professional Course', '2 Equal Intallments', 'Senayit ', 'Agazhe ', '07392836078', 600.00, 'November Registrations', 50.00, 'cs_live_a1ycdPWvCMj2bccJRbgtvVJLY5pJBpjELQHYNkN4ZLHx6ZsJv3CVdCOhf8', 4, 1, NULL, NULL),
(49, 19, NULL, 'm_arsema@yahoo.com', 'confirmed', '2026-10-28 16:41:21.190', 'Women\'s Hairdressing Professional Course', '2 Equal Intallments', 'Arsema', 'Michael', '07947571249', 600.00, 'November Registrations', 50.00, 'cs_live_a1qNsCilwijAEdPXRDF241QPFL9Matc55v0z8whkqMecCZsY909XEnnEtz', 4, 1, NULL, NULL),
(51, 19, NULL, 'mirafkidene2000@gmail.com', 'confirmed', '2026-10-29 12:13:52.382', 'Women\'s Hairdressing Professional Course', 'Pay in Full', 'miraf', 'kidene', '07383204555', 1200.00, 'November Registrations', 50.00, 'cs_live_a1xlmVbXuX4g89IRgcpBl3bIbj8rK3BkFRGAhlFsIRO0yMfiQLbllu603H', 3, 1, NULL, NULL),
(52, 13, NULL, 'yaredtesfau477@gmail.com', 'confirmed', '2026-10-29 12:24:00.430', 'Foundation Course', '2 Equal Intallments', 'yared', 'tesfau', '07404760716', 750.00, NULL, NULL, NULL, 4, 2, NULL, NULL),
(53, 19, NULL, 'niaayman358@gmail.com', 'confirmed', '2026-10-29 14:11:52.564', 'Women\'s Hairdressing Professional Course', 'Pay in Full', 'Hanan', 'Belcha', '07437983343', 1200.00, 'November Registrations', 50.00, NULL, 3, 3, NULL, NULL),
(54, 19, NULL, 'tirhas.berihu30@gmail.com', 'confirmed', '2026-10-30 17:11:46.858', 'Women\'s Hairdressing Professional Course', '2 Equal Intallments', 'Tirhas', 'Betihu', '07957552657', 600.00, 'November Registrations', 50.00, NULL, 4, 2, NULL, 'The remaking will be paid in tile'),
(55, 18, NULL, 'freimama1@gmail.com', 'confirmed', '2026-10-30 22:32:46.428', 'Women\'s Hairdressing Foundation Course', '3 Equal Instalments', 'Frie', 'Tsehaye', '07577398732', 600.00, NULL, NULL, NULL, 2, 2, NULL, NULL),
(56, 18, NULL, 'haregg1212@email.com', 'confirmed', '2026-10-30 22:49:59.931', 'Women\'s Hairdressing Foundation Course', '3 Equal Instalments', 'Hareg', 'Grimay', '07925471827', 600.00, NULL, NULL, NULL, 2, 2, NULL, 'She will pay Monday( Biruk friend)'),
(57, 19, NULL, 'misganaeyassu@gmail.com', 'confirmed', '2026-10-31 01:13:12.209', 'Women\'s Hairdressing Professional Course', '2 Equal Intallments', 'Misgna', 'Eyassu', '07858999003', 600.00, 'November Registrations', 50.00, NULL, 4, 3, NULL, NULL),
(59, 15, NULL, 'solomonalemushumye@gmail.com', 'confirmed', '2026-11-01 10:05:59.656', 'Master Barber Academy Diploma', '2 Equal Intallments', 'Solomon', 'Shumye', '07391 482032', 750.00, 'Opening Day Discount', 50.00, 'cs_live_a1sJx9D2fjqufLlq8zCfYEB4dZE1kEFlccJtnqyPr8loe5uGLgp4LXyVR1', 4, 1, NULL, NULL),
(60, 19, NULL, 'Selam_melake2000@yahoo.com', 'confirmed', '2026-11-01 14:18:44.420', 'Women\'s Hairdressing Professional Course', '2 Equal Intallments', 'Selam', 'Melake', '07949474053', 600.00, 'November Registrations', 50.00, NULL, 4, 2, NULL, NULL),
(61, 19, NULL, 'Fevenissak90@gmail.com', 'confirmed', '2026-11-04 22:26:17.033', 'Women\'s Hairdressing Professional Course', '2 Equal Intallments', 'Feven', 'Kidane', '07563637915', 600.00, 'November Registrations', 30.00, NULL, 4, 3, NULL, 'She will come and pay on 05/11/2026');

-- --------------------------------------------------------

--
-- Table structure for table `enrolment_payments`
--

CREATE TABLE `enrolment_payments` (
  `id` int(11) NOT NULL,
  `enrolment_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_way_id` int(11) DEFAULT NULL,
  `paid_on` date NOT NULL,
  `stripe_session_id` varchar(255) DEFAULT NULL,
  `note` varchar(500) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gallery`
--

CREATE TABLE `gallery` (
  `id` int(11) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `gallery`
--

INSERT INTO `gallery` (`id`, `image_url`) VALUES
(6, '9d6f43d0-420d-432e-a8de-c6979c5c81b0.webp'),
(7, '814e2114-0dcd-4f8e-a4f8-b431b5e2a785.webp'),
(8, 'f9a12344-6a63-4e2c-ba1e-901073968ce4.webp'),
(9, '45386a6f-7db7-4242-a64f-eaaca3df2d9d.webp'),
(10, 'df0d928d-4559-42ea-8dee-fea418b65ebc.webp');

-- --------------------------------------------------------

--
-- Table structure for table `haircut_requests`
--

CREATE TABLE `haircut_requests` (
  `id` int(11) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `client_email` varchar(255) NOT NULL,
  `preferred_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('requested','scheduled','completed') DEFAULT 'requested',
  `created_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3),
  `preferred_style` varchar(255) DEFAULT NULL,
  `preferred_time` varchar(50) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `client_phone` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification_emails`
--

CREATE TABLE `notification_emails` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `notification_emails`
--

INSERT INTO `notification_emails` (`id`, `email`, `created_at`) VALUES
(1, 'admin@dndbarberacademy.com', '2026-10-11 19:50:20'),
(2, 'info@dndbarberacademy.com', '2026-10-11 19:50:32'),
(3, 'dndbarberacademy@gmail.com', '2026-10-19 21:00:21');

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `kind` enum('full','instalments','deposit') NOT NULL,
  `instalments` int(11) DEFAULT NULL,
  `percent_off` decimal(5,2) NOT NULL DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `name`, `kind`, `instalments`, `percent_off`, `description`, `sort_order`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'Deposit to Secure', 'deposit', NULL, 0.00, 'Lock in your place today\nBalance due before start day\nQuickest way to enrol', 1, 1, NULL, 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', '2026-10-08 22:12:29', '2026-10-11 19:42:44'),
(2, '3 Equal Instalments', 'instalments', 3, 0.00, 'Spread the cost over 3 months\n0% interest · Equal payments\nNo credit check required', 2, 1, NULL, 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', '2026-10-08 22:12:29', '2026-10-11 19:42:48'),
(3, 'Pay in Full', 'full', NULL, 0.00, 'Best value · Save 10%\nOne payment, nothing to track\nImmediate confirmation', 3, 1, NULL, 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', '2026-10-08 22:12:29', '2026-10-11 20:04:31'),
(4, '2 Equal Intallments', 'instalments', 2, 0.00, '2 Equal Intallments', 0, 1, 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', '2026-10-08 22:19:08', '2026-10-11 19:42:32');

-- --------------------------------------------------------

--
-- Table structure for table `payment_ways`
--

CREATE TABLE `payment_ways` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `payment_ways`
--

INSERT INTO `payment_ways` (`id`, `name`, `slug`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Stripe', 'stripe', 0, '2026-10-12 19:21:52', '2026-10-12 19:21:52'),
(2, 'Bank Transfer', 'bank_transfer', 1, '2026-10-12 19:21:52', '2026-10-12 19:21:52'),
(3, 'Cash', 'cash', 2, '2026-10-12 19:21:52', '2026-10-12 19:21:52');

-- --------------------------------------------------------

--
-- Table structure for table `pricing_options`
--

CREATE TABLE `pricing_options` (
  `id` int(11) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `type` enum('deposit','instalments','full_payment') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `note` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pricing_options`
--

INSERT INTO `pricing_options` (`id`, `course_id`, `type`, `amount`, `note`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 13, 'deposit', 750.00, '50% non-refundable deposit required to secure your place.', 1, NULL, NULL, '2026-10-06 18:55:29', '2026-10-06 18:55:29'),
(2, 14, 'deposit', 1150.00, '50% non-refundable deposit required to secure your place.', 1, NULL, NULL, '2026-10-06 18:55:29', '2026-10-06 18:55:29'),
(3, 15, 'deposit', 1500.00, '50% non-refundable deposit required to secure your place.', 1, NULL, NULL, '2026-10-06 18:55:29', '2026-10-06 18:55:29'),
(4, 16, 'deposit', 750.00, '50% non-refundable deposit required to secure your place.', 1, NULL, NULL, '2026-10-06 18:55:29', '2026-10-06 18:55:29'),
(5, 17, 'deposit', 2100.00, '50% non-refundable deposit required to secure your place.', 1, NULL, NULL, '2026-10-06 18:55:29', '2026-10-06 18:55:29'),
(8, 13, 'instalments', 750.00, 'Remaining 50% paid in equal instalments every 2 weeks throughout your course. All course fees must be paid in full before your diploma or certificate is issued.', 1, NULL, NULL, '2026-10-06 18:55:29', '2026-10-06 18:55:29'),
(9, 14, 'instalments', 1150.00, 'Remaining 50% paid in equal instalments every 2 weeks throughout your course. All course fees must be paid in full before your diploma or certificate is issued.', 1, NULL, NULL, '2026-10-06 18:55:29', '2026-10-06 18:55:29'),
(10, 15, 'instalments', 1500.00, 'Remaining 50% paid in equal instalments every 2 weeks throughout your course. All course fees must be paid in full before your diploma or certificate is issued.', 1, NULL, NULL, '2026-10-06 18:55:29', '2026-10-06 18:55:29'),
(11, 16, 'instalments', 750.00, 'Remaining 50% paid in equal instalments every 2 weeks throughout your course. All course fees must be paid in full before your diploma or certificate is issued.', 1, NULL, NULL, '2026-10-06 18:55:29', '2026-10-06 18:55:29'),
(12, 17, 'instalments', 2100.00, 'Remaining 50% paid in equal instalments every 2 weeks throughout your course. All course fees must be paid in full before your diploma or certificate is issued.', 1, NULL, NULL, '2026-10-06 18:55:29', '2026-10-06 18:55:29'),
(15, 13, 'full_payment', 1500.00, 'Pay the full course fee upfront.', 1, NULL, NULL, '2026-10-06 18:55:29', '2026-10-06 18:55:29'),
(16, 14, 'full_payment', 2300.00, 'Pay the full course fee upfront.', 1, NULL, NULL, '2026-10-06 18:55:29', '2026-10-06 18:55:29'),
(17, 15, 'full_payment', 3000.00, 'Pay the full course fee upfront.', 1, NULL, NULL, '2026-10-06 18:55:29', '2026-10-06 18:55:29'),
(18, 16, 'full_payment', 1500.00, 'Pay the full course fee upfront.', 1, NULL, NULL, '2026-10-06 18:55:29', '2026-10-06 18:55:29'),
(19, 17, 'full_payment', 4200.00, 'Pay the full course fee upfront.', 1, NULL, NULL, '2026-10-06 18:55:29', '2026-10-06 18:55:29');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `booking_link` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `name`, `price`, `description`, `image_url`, `booking_link`) VALUES
(1, 'Standard Adults Haircut(14)', 15.00, 'Variety of cuts including classic haircuts, fade and taper, buzz cut, undercut and more tailored to suit your style.', 'images (1).webp', 'https://simplybook.me/en/'),
(2, 'Clippers All Over', 10.00, 'Enjoy a fresh cut followed by a relaxing hair wash using premium shampoo for a clean finish.', 'images (2).webp', 'https://simplybook.me/en/'),
(3, 'Skin Fade', 20.00, 'A quick touch-up to keep your edges sharp, focused on the hairline, sideburns and neckline.', 'images (3).webp', 'https://simplybook.me/en/'),
(4, 'Children\'s Haircut (Under 13)', 15.00, 'Gentle and professional haircuts for young children in a comfortable, easy environment.', 'images (4).webp', 'https://simplybook.me/en/'),
(6, 'Full Service', 25.00, 'Haircut, Shape Up, Streamer, Hot Towel, Facial Waning', 'images (6).webp', 'https://simplybook.me/en/'),
(7, 'Head Shave and Clean Shave', 15.00, 'Whether you want a bold change or a subtle refresh, our colouring service is tailored to your look.', 'images (7).webp', 'https://simplybook.me/en/'),
(9, 'Colouring Beard or Hair', 10.00, 'Transform your look with a haircut, colouring and beard service tailored to your style.', 'images (12).webp', 'https://simplybook.me/en/'),
(10, 'Beard Dye', 10.00, 'Professional braids for men with clean parting, precision and a sharp finished look.', 'images (7).webp', 'https://simplybook.me/en/'),
(11, 'Facial Hot Towel', 0.00, 'Facial treatments designed to support healthier, cleaner and more refreshed skin.', 'images (13).webp', 'https://simplybook.me/en/'),
(12, 'Hot Towel & Steam', 0.00, 'A rejuvenating face steam treatment that opens pores, helps cleanse skin and refreshes your face.', 'images (11).webp', 'https://simplybook.me/en/');

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

CREATE TABLE `session` (
  `id` varchar(36) NOT NULL,
  `expires_at` datetime NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ip_address` text DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `user_id` varchar(36) NOT NULL,
  `impersonated_by` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `session`
--

INSERT INTO `session` (`id`, `expires_at`, `token`, `created_at`, `updated_at`, `ip_address`, `user_agent`, `user_id`, `impersonated_by`) VALUES
('4WMSrKtzgAAOSnPOgAwXX5UhVUKPUEVz', '2026-10-19 21:49:40', 'XkKQ169buZlSrUWV1diYobHN6qHhbZoY', '2026-10-12 20:49:40.960', '2026-10-12 20:49:40', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('5OZ63AS5SZyH3V5p6j5bfHBPqRFdI5fl', '2026-10-26 11:52:15', 'vGcv0EE5wydvulrsXDIvhwpM9uJ1lNxC', '2026-10-09 12:34:50.019', '2026-10-19 10:52:15', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('DG6fzEzIMAZJvQGntr0KlMshwigf00w6', '2026-11-13 10:04:19', '9jKwcBmXavpGh7bCUnMy6L2sVycxMyvx', '2026-10-19 09:35:59.048', '2026-11-06 10:04:19', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('EAAySjmMUJ6zVCNxDG5YAJduZaoY7ZOq', '2026-10-25 16:12:56', 'eNO65SWAe0GnXIHn5T2vvmBXAXykPlGy', '2026-10-18 15:12:56.632', '2026-10-18 15:12:56', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('EqYTc49ZV1FefxgoOgffMNACtqB4hAMh', '2026-11-13 18:08:49', 'spalx25cLxywk643MxfKIOaF8GyGGl0I', '2026-10-19 20:45:49.263', '2026-11-06 18:08:49', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('fh5EEGpSarEu1cksaIQ1aDmLsHzxKZE6', '2026-11-11 10:20:27', 'HwSrqUTdl3kYQGOMca7IW7vNKX2wrLt6', '2026-10-29 13:12:02.369', '2026-11-04 10:20:27', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('gf2JgqdOw3FEr4ko5qX0Q5uoMLPf4YkK', '2026-11-05 13:11:52', 'nQGve28u5hjdiaCp4qA1b7AHVj61nkja', '2026-10-29 13:11:52.206', '2026-10-29 13:11:52', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('Ib1STnBIKP6CXYMlJhAMpb3IrtCPsxxC', '2026-10-19 19:47:16', 'D7t61j0dg3e5griTt7gw2c936tNsnpJq', '2026-10-06 15:16:19.081', '2026-10-12 18:47:16', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('IZAuJZa0JKsz9Jv9guwulJSMnBnVls8U', '2026-10-30 14:43:54', 'heb8araGJ2m1L84piI9dyN0javxV3vMc', '2026-10-13 12:47:58.455', '2026-10-23 13:43:54', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('K7PqxV4jriBNSfJGJKVwG2pjObC5FT9f', '2026-10-21 12:23:09', 'Ul3gPVECWADhZx3YDot3wt9g7sPDNG6E', '2026-10-14 11:23:09.993', '2026-10-14 11:23:09', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('m9fqEvk21COiJK0xkruOswBZir5LliRn', '2026-11-08 19:19:17', '0nN0HCYRGCcAYdLS0JlLw1qKLCcLdE6I', '2026-11-01 19:19:17.950', '2026-11-01 19:19:17', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('NsLvIS1INptKWdMVTPJmDtwWXV5qFT8A', '2026-11-13 13:39:33', '1YUijTHMaI47w5rOxwllv6biSwgqvWVU', '2026-10-19 09:52:07.133', '2026-11-06 13:39:33', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('o4IsBUhWwBEIXuFsGyRo4XFGfzt9ShNR', '2026-10-19 11:18:27', '39BhxRYywwU4cUTNIWyfnAsFZpx4COsB', '2026-10-12 10:18:27.015', '2026-10-12 10:18:27', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('OlCGZ2RhUovYtsOLIlCOPXW9nIGdt3gb', '2026-10-20 20:23:11', '9DhLPJQ2GhpT0S4R9zva6oh7Xk5fQjxz', '2026-10-13 19:23:11.829', '2026-10-13 19:23:11', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('prTdCeow1F07fCHQpUSFCyi6V6qO28MW', '2026-10-19 22:10:42', 'HNZspy0YgMSjCxnr5gzS1GLWumPOUjDj', '2026-10-12 21:10:42.474', '2026-10-12 21:10:42', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('Q09soRqGp2vwZ8S2Yla3OzWlqwSkvY2B', '2026-10-20 13:55:11', 'Hu5qhATZK45XkZ72hMPh0QmRhqkSQVa0', '2026-10-13 12:55:11.400', '2026-10-13 12:55:11', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('RlNzACuLUuzwEiHpuyHHSoOPSMwa0l9M', '2026-11-13 19:21:38', 'bJiYRBxP5uAxFsymAW3QJ8QQiXGMLier', '2026-10-20 09:53:12.906', '2026-11-06 19:21:38', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('uTbQKbyeWqAwXQsX448EX5SBdn2WUzTp', '2026-10-26 20:49:34', 'j8Q6trxHu1qomjMYVlzMsugBCwr35vTB', '2026-10-19 19:49:34.238', '2026-10-19 19:49:34', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL),
('WFrRz6LXfr2DvHb0sgCIVRfLE7H9x1am', '2026-10-18 19:45:38', 'HUR5DR83yAF6cBDVHPlXLHhmPJDARC5n', '2026-10-11 18:45:38.594', '2026-10-11 18:45:38', '', '', 'oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_reports`
--

CREATE TABLE `student_reports` (
  `id` int(11) NOT NULL,
  `enrolment_id` int(11) NOT NULL,
  `report_date` date NOT NULL,
  `week` int(11) NOT NULL,
  `week_title` varchar(255) NOT NULL,
  `teacher_name` varchar(255) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_report_marks`
--

CREATE TABLE `student_report_marks` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `skill` varchar(255) NOT NULL,
  `mark` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `image` text DEFAULT NULL,
  `role` text DEFAULT NULL,
  `banned` tinyint(1) DEFAULT NULL,
  `ban_reason` text DEFAULT NULL,
  `ban_expires` timestamp(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `created_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `email_verified`, `image`, `role`, `banned`, `ban_reason`, `ban_expires`, `created_at`, `updated_at`) VALUES
('oB1G2JxYET1BiZqNSLdWZqzLrNVecks4', 'Admin', 'admin@dndbarberacademy.com', 0, NULL, NULL, NULL, NULL, '2026-04-05 20:56:18.604', '2026-04-05 17:56:18.597', '2026-04-05 17:56:18.597');

-- --------------------------------------------------------

--
-- Table structure for table `verification`
--

CREATE TABLE `verification` (
  `id` varchar(36) NOT NULL,
  `identifier` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `__drizzle_migrations`
--

CREATE TABLE `__drizzle_migrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `hash` text NOT NULL,
  `created_at` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `business_hours`
--
ALTER TABLE `business_hours`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `business_hours_day_of_week_idx` (`day_of_week`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `certificates_code_unique` (`code`),
  ADD KEY `certificates_enrolment_id_enrolments_id_fk` (`enrolment_id`),
  ADD KEY `certificates_created_by_user_id_fk` (`created_by`),
  ADD KEY `certificates_updated_by_user_id_fk` (`updated_by`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `classes_course_id_courses_id_fk` (`course_id`);

--
-- Indexes for table `class_sessions`
--
ALTER TABLE `class_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_sessions_class_id_classes_id_fk` (`class_id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `courses_slug_unique` (`slug`);

--
-- Indexes for table `course_discounts`
--
ALTER TABLE `course_discounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_discounts_created_by_user_id_fk` (`created_by`),
  ADD KEY `course_discounts_updated_by_user_id_fk` (`updated_by`);

--
-- Indexes for table `course_discount_courses`
--
ALTER TABLE `course_discount_courses`
  ADD PRIMARY KEY (`discount_id`,`course_id`),
  ADD KEY `course_discount_courses_course_id_courses_id_fk` (`course_id`);

--
-- Indexes for table `course_payment_methods`
--
ALTER TABLE `course_payment_methods`
  ADD PRIMARY KEY (`course_id`,`method_id`),
  ADD KEY `course_payment_methods_method_id_payment_methods_id_fk` (`method_id`);

--
-- Indexes for table `discount_nullifications`
--
ALTER TABLE `discount_nullifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `discount_nullifications_enrolment_id_unique` (`enrolment_id`),
  ADD KEY `discount_nullifications_created_by_user_id_fk` (`created_by`),
  ADD KEY `discount_nullifications_updated_by_user_id_fk` (`updated_by`);

--
-- Indexes for table `enrolments`
--
ALTER TABLE `enrolments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `enrolments_stripe_session_id_unique` (`stripe_session_id`),
  ADD KEY `enrolments_payment_method_id_payment_methods_id_fk` (`payment_method_id`),
  ADD KEY `enrolments_payment_way_id_payment_ways_id_fk` (`payment_way_id`);

--
-- Indexes for table `enrolment_payments`
--
ALTER TABLE `enrolment_payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `enrolment_payments_stripe_session_id_unique` (`stripe_session_id`);

--
-- Indexes for table `gallery`
--
ALTER TABLE `gallery`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `haircut_requests`
--
ALTER TABLE `haircut_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notification_emails`
--
ALTER TABLE `notification_emails`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `notification_emails_email_unique` (`email`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_methods_created_by_user_id_fk` (`created_by`),
  ADD KEY `payment_methods_updated_by_user_id_fk` (`updated_by`);

--
-- Indexes for table `payment_ways`
--
ALTER TABLE `payment_ways`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_ways_slug_unique` (`slug`);

--
-- Indexes for table `pricing_options`
--
ALTER TABLE `pricing_options`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token_unique` (`token`);

--
-- Indexes for table `student_reports`
--
ALTER TABLE `student_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_reports_enrolment_id_enrolments_id_fk` (`enrolment_id`);

--
-- Indexes for table `student_report_marks`
--
ALTER TABLE `student_report_marks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_report_marks_report_id_student_reports_id_fk` (`report_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_email_unique` (`email`);

--
-- Indexes for table `verification`
--
ALTER TABLE `verification`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `__drizzle_migrations`
--
ALTER TABLE `__drizzle_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `business_hours`
--
ALTER TABLE `business_hours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `class_sessions`
--
ALTER TABLE `class_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `course_discounts`
--
ALTER TABLE `course_discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `discount_nullifications`
--
ALTER TABLE `discount_nullifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrolments`
--
ALTER TABLE `enrolments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `enrolment_payments`
--
ALTER TABLE `enrolment_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gallery`
--
ALTER TABLE `gallery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `haircut_requests`
--
ALTER TABLE `haircut_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notification_emails`
--
ALTER TABLE `notification_emails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `payment_ways`
--
ALTER TABLE `payment_ways`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `pricing_options`
--
ALTER TABLE `pricing_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `student_reports`
--
ALTER TABLE `student_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_report_marks`
--
ALTER TABLE `student_report_marks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `__drizzle_migrations`
--
ALTER TABLE `__drizzle_migrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `certificates_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `certificates_enrolment_id_enrolments_id_fk` FOREIGN KEY (`enrolment_id`) REFERENCES `enrolments` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `certificates_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `class_sessions`
--
ALTER TABLE `class_sessions`
  ADD CONSTRAINT `class_sessions_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `course_discounts`
--
ALTER TABLE `course_discounts`
  ADD CONSTRAINT `course_discounts_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `course_discounts_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

--
-- Constraints for table `course_discount_courses`
--
ALTER TABLE `course_discount_courses`
  ADD CONSTRAINT `course_discount_courses_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `course_discount_courses_discount_id_course_discounts_id_fk` FOREIGN KEY (`discount_id`) REFERENCES `course_discounts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `course_payment_methods`
--
ALTER TABLE `course_payment_methods`
  ADD CONSTRAINT `course_payment_methods_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `course_payment_methods_method_id_payment_methods_id_fk` FOREIGN KEY (`method_id`) REFERENCES `payment_methods` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `discount_nullifications`
--
ALTER TABLE `discount_nullifications`
  ADD CONSTRAINT `discount_nullifications_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `discount_nullifications_enrolment_id_enrolments_id_fk` FOREIGN KEY (`enrolment_id`) REFERENCES `enrolments` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `discount_nullifications_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

--
-- Constraints for table `enrolments`
--
ALTER TABLE `enrolments`
  ADD CONSTRAINT `enrolments_payment_method_id_payment_methods_id_fk` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `enrolments_payment_way_id_payment_ways_id_fk` FOREIGN KEY (`payment_way_id`) REFERENCES `payment_ways` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

--
-- Constraints for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD CONSTRAINT `payment_methods_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `payment_methods_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

--
-- Constraints for table `student_reports`
--
ALTER TABLE `student_reports`
  ADD CONSTRAINT `student_reports_enrolment_id_enrolments_id_fk` FOREIGN KEY (`enrolment_id`) REFERENCES `enrolments` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `student_report_marks`
--
ALTER TABLE `student_report_marks`
  ADD CONSTRAINT `student_report_marks_report_id_student_reports_id_fk` FOREIGN KEY (`report_id`) REFERENCES `student_reports` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
