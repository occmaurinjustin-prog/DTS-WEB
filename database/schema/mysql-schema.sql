/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `attendance_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `attendance_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `attendance_type` enum('morning_in','morning_out','afternoon_in','afternoon_out') COLLATE utf8mb4_unicode_ci NOT NULL,
  `captured_at` datetime NOT NULL,
  `latitude` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `longitude` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `face_confidence` decimal(5,2) DEFAULT NULL,
  `device_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `attendance_logs_attendance_id_foreign` (`attendance_id`),
  KEY `attendance_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `attendance_logs_attendance_id_foreign` FOREIGN KEY (`attendance_id`) REFERENCES `attendances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `attendances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendances` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `attendance_date` date NOT NULL,
  `morning_in` time DEFAULT NULL,
  `morning_out` time DEFAULT NULL,
  `afternoon_in` time DEFAULT NULL,
  `afternoon_out` time DEFAULT NULL,
  `late_minutes` int NOT NULL DEFAULT '0',
  `undertime_minutes` int NOT NULL DEFAULT '0',
  `overtime_minutes` int NOT NULL DEFAULT '0',
  `total_work_hours` decimal(8,2) NOT NULL DEFAULT '0.00',
  `status` enum('Present','Late','Half Day','Absent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Present',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `attendances_user_id_attendance_date_unique` (`user_id`,`attendance_date`),
  CONSTRAINT `attendances_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `client_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `client_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliveries` (
  `delivery_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `driver_id` bigint unsigned NOT NULL,
  `client_id` bigint unsigned NOT NULL,
  `truck_id` bigint unsigned DEFAULT NULL,
  `delivery_status` enum('pending','approved','rejected','assigned','in_transit','delivered','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `navigation_phase` enum('pickup','delivery') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pickup',
  `proof_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `actual_delivery_latitude` decimal(10,8) DEFAULT NULL,
  `actual_delivery_longitude` decimal(11,8) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `sent_to_driver_at` timestamp NULL DEFAULT NULL,
  `sent_to_driver_by` bigint unsigned DEFAULT NULL,
  `weight_tons` decimal(8,2) NOT NULL,
  `item_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `waybill` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pickup_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickup_latitude` decimal(10,8) DEFAULT NULL,
  `pickup_longitude` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `delivery_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_latitude` decimal(10,8) DEFAULT NULL,
  `delivery_longitude` decimal(11,8) DEFAULT NULL,
  `priority` enum('normal','high','urgent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `estimated_delivery_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`delivery_id`),
  UNIQUE KEY `deliveries_tracking_number_unique` (`waybill`),
  KEY `deliveries_driver_id_foreign` (`driver_id`),
  KEY `deliveries_client_id_foreign` (`client_id`),
  KEY `deliveries_user_id_foreign` (`user_id`),
  KEY `deliveries_truck_id_foreign` (`truck_id`),
  KEY `deliveries_sent_to_driver_by_foreign` (`sent_to_driver_by`),
  CONSTRAINT `deliveries_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`) ON DELETE CASCADE,
  CONSTRAINT `deliveries_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE CASCADE,
  CONSTRAINT `deliveries_sent_to_driver_by_foreign` FOREIGN KEY (`sent_to_driver_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `deliveries_truck_id_foreign` FOREIGN KEY (`truck_id`) REFERENCES `trucks` (`truck_id`),
  CONSTRAINT `deliveries_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `driver_stops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_stops` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `driver_id` bigint unsigned NOT NULL,
  `delivery_id` bigint unsigned DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `stopped_at` timestamp NOT NULL,
  `resumed_at` timestamp NULL DEFAULT NULL,
  `duration_minutes` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `driver_stops_driver_id_foreign` (`driver_id`),
  KEY `driver_stops_delivery_id_foreign` (`delivery_id`),
  CONSTRAINT `driver_stops_delivery_id_foreign` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries` (`delivery_id`) ON DELETE CASCADE,
  CONSTRAINT `driver_stops_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `driver_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `truck_id` bigint unsigned DEFAULT NULL,
  `current_latitude` decimal(10,8) DEFAULT NULL,
  `current_longitude` decimal(11,8) DEFAULT NULL,
  `last_location_update` timestamp NULL DEFAULT NULL,
  `current_speed` int NOT NULL DEFAULT '0',
  `is_gps_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `license_no` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `availability_status` enum('available','busy','in_transit','off_duty') COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`driver_id`),
  KEY `drivers_user_id_foreign` (`user_id`),
  KEY `drivers_truck_id_foreign` (`truck_id`),
  CONSTRAINT `drivers_truck_id_foreign` FOREIGN KEY (`truck_id`) REFERENCES `trucks` (`truck_id`) ON DELETE SET NULL,
  CONSTRAINT `drivers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `face_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `face_registrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `face_encoding` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `registered_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `face_registrations_user_id_foreign` (`user_id`),
  CONSTRAINT `face_registrations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `Inventory_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `part_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `part_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `min_stock_level` int NOT NULL DEFAULT '5',
  `part_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`Inventory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `maintenance_parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_parts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `maintenance_report_id` bigint unsigned NOT NULL,
  `inventory_id` bigint unsigned NOT NULL,
  `quantity_used` int NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `maintenance_parts_maintenance_report_id_index` (`maintenance_report_id`),
  KEY `maintenance_parts_inventory_id_index` (`inventory_id`),
  CONSTRAINT `maintenance_parts_inventory_id_foreign` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`Inventory_id`) ON DELETE CASCADE,
  CONSTRAINT `maintenance_parts_maintenance_report_id_foreign` FOREIGN KEY (`maintenance_report_id`) REFERENCES `maintenance_reports` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `maintenance_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_reports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `driver_id` bigint unsigned DEFAULT NULL,
  `truck_id` bigint unsigned DEFAULT NULL,
  `mechanic_id` bigint unsigned DEFAULT NULL,
  `inspection_date` date DEFAULT NULL,
  `overall_condition` enum('good','fair','poor','critical') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mileage` decimal(10,2) DEFAULT NULL,
  `issue_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issue_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority_level` enum('low','medium','high','emergency') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `status` enum('pending','in_review','reviewed','approved','scheduled','in_progress','completed','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `assigned_to` bigint unsigned DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `maintenance_reports_assigned_to_foreign` (`assigned_to`),
  KEY `maintenance_reports_driver_id_status_index` (`driver_id`,`status`),
  KEY `maintenance_reports_truck_id_status_index` (`truck_id`,`status`),
  KEY `maintenance_reports_priority_level_status_index` (`priority_level`,`status`),
  CONSTRAINT `maintenance_reports_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `maintenance_reports_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE CASCADE,
  CONSTRAINT `maintenance_reports_truck_id_foreign` FOREIGN KEY (`truck_id`) REFERENCES `trucks` (`truck_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `maintenances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenances` (
  `maintenance_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `maintenance_report_id` bigint unsigned DEFAULT NULL,
  `repair_date` date DEFAULT NULL,
  `repair_time` time DEFAULT NULL,
  `repair_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `assign_mechanics` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`maintenance_id`),
  KEY `maintenances_maintenance_report_id_foreign` (`maintenance_report_id`),
  KEY `maintenances_assign_mechanics_foreign` (`assign_mechanics`),
  CONSTRAINT `maintenances_assign_mechanics_foreign` FOREIGN KEY (`assign_mechanics`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `maintenances_maintenance_report_id_foreign` FOREIGN KEY (`maintenance_report_id`) REFERENCES `maintenance_reports` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll` (
  `payroll_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `total_hours` decimal(8,2) NOT NULL DEFAULT '0.00',
  `hourly_rate` decimal(10,2) NOT NULL DEFAULT '0.00',
  `overtime_pay` decimal(10,2) NOT NULL DEFAULT '0.00',
  `deductions` decimal(10,2) NOT NULL DEFAULT '0.00',
  `gross_salary` decimal(10,2) NOT NULL DEFAULT '0.00',
  `net_salary` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`payroll_id`),
  KEY `payroll_user_id_foreign` (`user_id`),
  CONSTRAINT `payroll_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `trucks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trucks` (
  `truck_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `unique_id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plate_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` decimal(10,2) NOT NULL,
  `condition` enum('excellent','good','fair','poor','needs_maintenance') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'good',
  `truck_status` enum('available','in_use','maintenance','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`truck_id`),
  UNIQUE KEY `trucks_plate_number_unique` (`plate_number`),
  UNIQUE KEY `trucks_unique_id_unique` (`unique_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exchangepassword` tinyint(1) NOT NULL DEFAULT '0',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','operation_manager','office_staff','driver','mechanic') COLLATE utf8mb4_unicode_ci NOT NULL,
  `face_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Not Registered',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `extension_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firstname` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `middle_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastname` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (1,'0001_01_01_000000_create_users_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (4,'2026_04_08_140928_create_users_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (5,'2026_04_08_140945_create_information_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (6,'2026_04_08_141010_create_admins_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (7,'2026_04_08_141011_create_operation_managers_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (8,'2026_04_08_141023_create_office_staff_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (9,'2026_04_08_141024_create_drivers_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (10,'2026_04_08_141114_create_clients_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (11,'2026_04_08_141115_create_deliveries_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (13,'2026_04_11_022337_add_remember_token_to_users_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (14,'2026_04_11_054240_add_missing_approval_fields_to_deliveries_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (15,'2026_04_11_060001_add_missing_fields_to_deliveries_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (16,'2026_04_11_070000_fix_deliveries_status_enum',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (17,'2026_04_13_130000_add_role_specific_attributes_to_users_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (18,'2026_04_13_130200_add_middle_name_to_users_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (19,'2026_04_13_130300_drop_role_specific_tables',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (20,'2026_04_13_130400_update_deliveries_manager_reference',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (22,'2026_04_13_130600_remove_manager_attribute_from_users_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (23,'2026_04_13_140000_create_trucks_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (24,'2026_04_13_150000_remove_plate_number_from_drivers_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (25,'2026_04_13_160000_remove_vehicle_type_from_drivers_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (26,'2026_04_13_170000_add_truck_id_to_deliveries_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (27,'2026_04_13_190000_add_truck_id_to_drivers_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (28,'2026_04_14_092934_create_attendance_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (29,'2026_04_14_092935_create_payroll_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (30,'2026_04_14_093048_create_inventory_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (31,'2026_04_14_093934_add_missing_fields_to_users_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (32,'2026_04_14_094752_add_truck_id_to_drivers_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (33,'2026_04_14_094901_change_weight_kg_to_weight_tons_in_deliveries_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (34,'2026_04_14_102142_add_driver_id_to_trucks_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (35,'2026_04_18_102234_add_sent_to_driver_fields_to_deliveries_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (36,'2026_04_18_120000_add_send_to_driver_fields_to_deliveries_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (37,'2026_04_18_124449_add_started_at_to_deliveries_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (41,'2026_04_21_124500_add_remember_token_to_users',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (42,'2026_04_21_142500_make_driver_fields_nullable',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (44,'2026_04_21_155000_add_pickup_address_to_deliveries_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (46,'2026_04_21_155600_drop_old_manager_foreign_key_from_deliveries',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (47,'2026_04_21_160000_add_approved_at_to_deliveries_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (48,'2026_04_21_160400_add_sent_to_driver_fields_to_deliveries',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (49,'2026_04_21_160900_update_status_enum_in_deliveries',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (55,'2026_04_28_000001_add_mechanic_role_to_users_table',4);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (57,'2026_04_28_210000_create_payroll_records_table',6);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (65,'2026_05_01_000001_create_mechanic_attendances_table',10);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (67,'2026_05_06_000001_create_maintenance_records_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (68,'2026_05_06_000002_create_inventory_parts_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (81,'2026_05_08_181222_create_maintenance_reports_table',14);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (89,'2026_04_21_171000_add_coordinates_to_deliveries_table',16);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (90,'2026_04_22_132207_add_gps_fields_to_drivers_table',17);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (92,'2026_04_26_204000_add_navigation_phase_to_deliveries',19);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (93,'2026_05_10_014001_create_maintenance_parts_table',20);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (95,'2026_05_10_050000_add_maintenance_details_to_maintenance_reports_table',21);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (96,'2026_05_10_050000_create_maintenances_table',22);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (97,'2026_04_13_130500_drop_inquiries_table',23);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (98,'2026_04_21_122400_remove_truck_fields_from_users',23);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (99,'2026_04_21_123500_remove_driver_id_from_trucks_table',23);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (100,'2026_04_21_124000_ensure_trucks_table_exists',23);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (101,'2026_04_21_154300_add_weight_tons_to_deliveries_table',23);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (102,'2026_04_21_155300_drop_weight_kg_from_deliveries_table',23);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (103,'2026_04_26_100000_update_driver_availability_status',23);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (105,'2026_05_11_072844_create_notifications_table',24);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (106,'2026_05_11_111349_add_part_status_to_inventory_table',25);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (107,'2026_05_19_024308_rename_tracking_number_to_waybill_in_deliveries_table',26);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (108,'2026_05_19_134000_add_proof_of_delivery_fields_to_deliveries_table',27);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (109,'2026_05_22_141942_remove_face_descriptor_and_unique_id_from_users_table',28);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (110,'2026_05_22_150641_add_assign_mechanics_to_maintenances_table',29);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (111,'2026_06_21_032953_add_unique_id_to_trucks_table',30);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (112,'2026_06_26_000000_drop_findings_from_maintenance_reports',31);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (113,'2026_06_26_000001_make_driver_id_nullable_in_maintenance_reports',32);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (114,'2026_07_02_000001_fix_maintenance_status_values',33);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (115,'2026_07_01_000000_update_maintenance_reports_status_enum',34);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (116,'2026_07_02_000002_add_in_progress_to_maintenance_status',35);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (117,'2026_06_22_074233_add_face_recognition_to_users_table',36);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (119,'2026_06_25_150658_update_attendances_table_for_mechanics',38);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (120,'2026_06_26_024617_add_face_recognition_to_users_table',39);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (122,'2026_06_26_161437_create_face_registrations_table',41);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (123,'2026_06_26_161439_create_payrolls_table',42);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (124,'2026_06_26_024707_create_attendances_table',43);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (125,'2026_06_26_161609_update_attendances_table_add_payroll_fields',44);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (126,'2026_06_27_015855_add_face_status_to_users_table',45);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (127,'2026_06_27_015911_create_attendance_table',46);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (128,'2026_06_27_015920_create_payroll_table',47);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (129,'2026_06_27_015902_create_face_registrations_table',48);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (130,'2026_06_27_162346_add_is_gps_enabled_to_drivers_table',49);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (131,'2026_06_29_144520_create_driver_stops_table',50);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (132,'2026_06_30_143712_create_attendances_table',51);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (133,'2026_06_30_143724_create_attendance_logs_table',52);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (135,'2026_06_30_205043_update_maintenance_reports_status_enum_again',53);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (136,'2026_06_30_211850_add_email_and_password_flags_to_users_table',54);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (137,'2026_07_01_093408_remove_location_columns_from_attendances_table',55);
