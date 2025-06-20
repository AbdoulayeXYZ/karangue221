-- MySQL dump 10.13  Distrib 5.7.24, for osx11.1 (x86_64)
--
-- Host: localhost    Database: karangue221
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary table structure for view `active_vehicle_status`
--

DROP TABLE IF EXISTS `active_vehicle_status`;
/*!50001 DROP VIEW IF EXISTS `active_vehicle_status`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `active_vehicle_status` AS SELECT 
 1 AS `vehicle_id`,
 1 AS `registration`,
 1 AS `brand`,
 1 AS `model`,
 1 AS `fleet_id`,
 1 AS `fleet_name`,
 1 AS `driver_id`,
 1 AS `driver_name`,
 1 AS `last_update`,
 1 AS `latitude`,
 1 AS `longitude`,
 1 AS `speed`,
 1 AS `fuel_level`,
 1 AS `ignition_status`,
 1 AS `engine_status`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activity_type_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `vehicle_id` int DEFAULT NULL,
  `driver_id` int DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `driver_id` (`driver_id`),
  KEY `idx_activities_type` (`activity_type_id`),
  KEY `idx_activities_timestamp` (`timestamp`),
  CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  CONSTRAINT `activities_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`),
  CONSTRAINT `fk_activities_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_activities_type` FOREIGN KEY (`activity_type_id`) REFERENCES `activity_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_activities_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_types`
--

DROP TABLE IF EXISTS `activity_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_types`
--

LOCK TABLES `activity_types` WRITE;
/*!40000 ALTER TABLE `activity_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `dashboard_summary`
--

DROP TABLE IF EXISTS `dashboard_summary`;
/*!50001 DROP VIEW IF EXISTS `dashboard_summary`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `dashboard_summary` AS SELECT 
 1 AS `fleet_id`,
 1 AS `fleet_name`,
 1 AS `total_vehicles`,
 1 AS `active_vehicles`,
 1 AS `maintenance_vehicles`,
 1 AS `inactive_vehicles`,
 1 AS `total_drivers`,
 1 AS `active_drivers`,
 1 AS `inactive_drivers`,
 1 AS `total_incidents`,
 1 AS `open_incidents`,
 1 AS `total_violations`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `device_telemetry_config`
--

DROP TABLE IF EXISTS `device_telemetry_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `device_telemetry_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` int NOT NULL,
  `config_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_device_config` (`device_id`,`config_name`),
  KEY `idx_device_config_device` (`device_id`),
  KEY `idx_device_config_active` (`active`),
  CONSTRAINT `fk_device_config_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_telemetry_config`
--

LOCK TABLES `device_telemetry_config` WRITE;
/*!40000 ALTER TABLE `device_telemetry_config` DISABLE KEYS */;
/*!40000 ALTER TABLE `device_telemetry_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device_types`
--

DROP TABLE IF EXISTS `device_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `device_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_types`
--

LOCK TABLES `device_types` WRITE;
/*!40000 ALTER TABLE `device_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `device_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `imei` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_type_id` int DEFAULT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `vehicle_id` int DEFAULT NULL,
  `firmware` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `installation_date` date DEFAULT NULL,
  `last_maintenance_date` date DEFAULT NULL,
  `model` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manufacturer` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sim_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_connection` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `imei` (`imei`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `idx_devices_type` (`device_type_id`),
  KEY `idx_devices_last_connection` (`last_connection`),
  CONSTRAINT `devices_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  CONSTRAINT `fk_devices_type` FOREIGN KEY (`device_type_id`) REFERENCES `device_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_devices_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `driver_performance`
--

DROP TABLE IF EXISTS `driver_performance`;
/*!50001 DROP VIEW IF EXISTS `driver_performance`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `driver_performance` AS SELECT 
 1 AS `driver_id`,
 1 AS `driver_name`,
 1 AS `fleet_id`,
 1 AS `fleet_name`,
 1 AS `current_score`,
 1 AS `trend`,
 1 AS `violation_count`,
 1 AS `average_score`,
 1 AS `current_vehicle`,
 1 AS `vehicle_model`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `driver_scores_history`
--

DROP TABLE IF EXISTS `driver_scores_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `driver_scores_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `driver_id` int NOT NULL,
  `score` int NOT NULL,
  `evaluation_date` date NOT NULL,
  `evaluator_id` int DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_driver_scores_evaluator` (`evaluator_id`),
  KEY `idx_driver_scores_driver` (`driver_id`),
  KEY `idx_driver_scores_date` (`evaluation_date`),
  CONSTRAINT `fk_driver_scores_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_driver_scores_evaluator` FOREIGN KEY (`evaluator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_scores_history`
--

LOCK TABLES `driver_scores_history` WRITE;
/*!40000 ALTER TABLE `driver_scores_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `driver_scores_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `drivers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `license_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `fleet_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `vehicle` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `overallScore` int DEFAULT '0',
  `trend` enum('up','down','stable') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'stable',
  `experience` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_training_date` date DEFAULT NULL,
  `next_training_date` date DEFAULT NULL,
  `license_expiry_date` date DEFAULT NULL,
  `profile_picture` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fleet_id` (`fleet_id`),
  KEY `idx_drivers_license` (`license_number`),
  KEY `idx_drivers_license_expiry` (`license_expiry_date`),
  KEY `idx_drivers_next_training` (`next_training_date`),
  CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`fleet_id`) REFERENCES `fleets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
INSERT INTO `drivers` VALUES (2,'Abdoulaye','Niasse','SN12345','+2217731470','abdoulaye@ddd.com','active',1,'2025-06-19 13:03:05',NULL,0,'stable',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fleets`
--

DROP TABLE IF EXISTS `fleets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fleets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `owner_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `fleets_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fleets`
--

LOCK TABLES `fleets` WRITE;
/*!40000 ALTER TABLE `fleets` DISABLE KEYS */;
INSERT INTO `fleets` VALUES (1,'Dakar Dem Dikk','Flotte Dakar Dem Dikk',1,'2025-06-19 13:01:57');
/*!40000 ALTER TABLE `fleets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incident_types`
--

DROP TABLE IF EXISTS `incident_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `incident_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `severity` enum('low','medium','high') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incident_types`
--

LOCK TABLES `incident_types` WRITE;
/*!40000 ALTER TABLE `incident_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `incident_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incidents`
--

DROP TABLE IF EXISTS `incidents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `incidents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int DEFAULT NULL,
  `driver_id` int DEFAULT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `incident_type_id` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `severity` enum('low','medium','high') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('open','resolved','ignored') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `timestamp` datetime DEFAULT NULL,
  `media_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `driver_id` (`driver_id`),
  KEY `idx_incidents_type` (`incident_type_id`),
  KEY `idx_incidents_timestamp` (`timestamp`),
  CONSTRAINT `fk_incidents_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_incidents_type` FOREIGN KEY (`incident_type_id`) REFERENCES `incident_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_incidents_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `incidents_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  CONSTRAINT `incidents_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidents`
--

LOCK TABLES `incidents` WRITE;
/*!40000 ALTER TABLE `incidents` DISABLE KEYS */;
/*!40000 ALTER TABLE `incidents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `maintenance_due`
--

DROP TABLE IF EXISTS `maintenance_due`;
/*!50001 DROP VIEW IF EXISTS `maintenance_due`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `maintenance_due` AS SELECT 
 1 AS `vehicle_id`,
 1 AS `registration`,
 1 AS `brand`,
 1 AS `model`,
 1 AS `fleet_id`,
 1 AS `fleet_name`,
 1 AS `last_maintenance_date`,
 1 AS `next_maintenance_date`,
 1 AS `insurance_expiry`,
 1 AS `technical_inspection_expiry`,
 1 AS `maintenance_status`,
 1 AS `insurance_status`,
 1 AS `inspection_status`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `maintenance_schedule`
--

DROP TABLE IF EXISTS `maintenance_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `maintenance_schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `maintenance_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `scheduled_date` date NOT NULL,
  `completed_date` date DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('scheduled','completed','canceled','overdue') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_maintenance_vehicle` (`vehicle_id`),
  KEY `idx_maintenance_scheduled_date` (`scheduled_date`),
  KEY `idx_maintenance_status` (`status`),
  CONSTRAINT `fk_maintenance_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_schedule`
--

LOCK TABLES `maintenance_schedule` WRITE;
/*!40000 ALTER TABLE `maintenance_schedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenance_schedule` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_maintenance_update` AFTER UPDATE ON `maintenance_schedule` FOR EACH ROW BEGIN
  -- If maintenance status changed to completed
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    -- Update vehicle's last maintenance date
    UPDATE vehicles
    SET 
      last_maintenance_date = NEW.completed_date,
      next_maintenance_date = DATE_ADD(NEW.completed_date, INTERVAL 3 MONTH)
    WHERE id = NEW.vehicle_id;
    
    -- Create a notification for the owner
    INSERT INTO notifications (user_id, type, message, timestamp)
    SELECT 
      u.id, 
      'maintenance', 
      CONCAT('Maintenance completed for vehicle ', v.registration, '. Next maintenance due on ', 
             DATE_FORMAT(DATE_ADD(NEW.completed_date, INTERVAL 3 MONTH), '%Y-%m-%d')),
      NOW()
    FROM 
      vehicles v
      JOIN fleets f ON v.fleet_id = f.id
      JOIN users u ON f.owner_id = u.id
    WHERE 
      v.id = NEW.vehicle_id;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `migration_history`
--

DROP TABLE IF EXISTS `migration_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migration_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phase` int DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `backup_file` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migration_history`
--

LOCK TABLES `migration_history` WRITE;
/*!40000 ALTER TABLE `migration_history` DISABLE KEYS */;
INSERT INTO `migration_history` VALUES (1,0,'2025-06-20 16:40:25','rolled_back','./database_backups/backup_karangue221_20250620_164024.sql'),(2,0,'2025-06-20 17:00:10','completed','./database_backups/backup_karangue221_20250620_170009.sql'),(3,1,'2025-06-20 17:00:10','completed','./database_backups/backup_karangue221_20250620_170009.sql'),(4,2,'2025-06-20 17:00:10','completed','./database_backups/backup_karangue221_20250620_170009.sql'),(5,3,'2025-06-20 17:00:10','completed','./database_backups/backup_karangue221_20250620_170009.sql');
/*!40000 ALTER TABLE `migration_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('unread','read') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'unread',
  `timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_timestamp` (`timestamp`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `daily_expiration_check` BEFORE INSERT ON `notifications` FOR EACH ROW BEGIN
  DECLARE is_daily_check BOOLEAN DEFAULT FALSE;
  
  -- Check if this is our special daily check trigger
  IF NEW.type = 'daily_check' THEN
    SET is_daily_check = TRUE;
    
    -- Process vehicle license expirations
    INSERT INTO notifications (user_id, type, message, timestamp)
    SELECT 
      u.id,
      'expiration',
      CONCAT('Vehicle ', v.registration, ' insurance expires in ', 
             DATEDIFF(v.insurance_expiry, CURDATE()), ' days'),
      NOW()
    FROM 
      vehicles v
      JOIN fleets f ON v.fleet_id = f.id
      JOIN users u ON f.owner_id = u.id
    WHERE 
      v.insurance_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY);
    
    -- Process driver license expirations
    INSERT INTO notifications (user_id, type, message, timestamp)
    SELECT 
      u.id,
      'expiration',
      CONCAT('Driver ', d.first_name, ' ', d.last_name, '\'s license expires in ', 
             DATEDIFF(d.license_expiry_date, CURDATE()), ' days'),
      NOW()
    FROM 
      drivers d
      JOIN fleets f ON d.fleet_id = f.id
      JOIN users u ON f.owner_id = u.id
    WHERE 
      d.license_expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY);
    
    -- Prevent the actual dummy notification from being inserted
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Daily check complete';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Temporary table structure for view `recent_violations`
--

DROP TABLE IF EXISTS `recent_violations`;
/*!50001 DROP VIEW IF EXISTS `recent_violations`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `recent_violations` AS SELECT 
 1 AS `violation_id`,
 1 AS `driver_id`,
 1 AS `driver_name`,
 1 AS `vehicle_id`,
 1 AS `registration`,
 1 AS `violation_type`,
 1 AS `severity`,
 1 AS `timestamp`,
 1 AS `location`,
 1 AS `speed`,
 1 AS `speedLimit`,
 1 AS `status`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `telemetry`
--

DROP TABLE IF EXISTS `telemetry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `telemetry` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `driver_id` int DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `speed` float DEFAULT NULL,
  `fuel_level` float DEFAULT NULL,
  `temperature` float DEFAULT NULL,
  `engine_temp` float DEFAULT NULL,
  `battery_level` float DEFAULT NULL,
  `engine_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acceleration` float DEFAULT NULL,
  `braking` float DEFAULT NULL,
  `heading` int DEFAULT NULL,
  `altitude` float DEFAULT NULL,
  `ignition_status` tinyint(1) DEFAULT NULL,
  `archived` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_telemetry_timestamp` (`timestamp`),
  KEY `idx_telemetry_vehicle_time` (`vehicle_id`,`timestamp`),
  KEY `idx_telemetry_driver` (`driver_id`),
  KEY `idx_telemetry_archived` (`archived`),
  CONSTRAINT `fk_telemetry_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_telemetry_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telemetry`
--

LOCK TABLES `telemetry` WRITE;
/*!40000 ALTER TABLE `telemetry` DISABLE KEYS */;
/*!40000 ALTER TABLE `telemetry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `telemetry_archive`
--

DROP TABLE IF EXISTS `telemetry_archive`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `telemetry_archive` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `driver_id` int DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `speed` float DEFAULT NULL,
  `fuel_level` float DEFAULT NULL,
  `temperature` float DEFAULT NULL,
  `engine_temp` float DEFAULT NULL,
  `battery_level` float DEFAULT NULL,
  `engine_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acceleration` float DEFAULT NULL,
  `braking` float DEFAULT NULL,
  `heading` int DEFAULT NULL,
  `altitude` float DEFAULT NULL,
  `ignition_status` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `archived` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_archive_vehicle_time` (`vehicle_id`,`timestamp`),
  KEY `idx_archive_timestamp` (`timestamp`),
  KEY `idx_archive_driver` (`driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `telemetry_archive`
--

LOCK TABLES `telemetry_archive` WRITE;
/*!40000 ALTER TABLE `telemetry_archive` DISABLE KEYS */;
/*!40000 ALTER TABLE `telemetry_archive` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('owner','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'owner',
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Owner Test','owner@karangue221.com','$2b$10$1k5fPrWOcs8Oo.wHfj8eS.Vz6H0Vh02ARjPY2/t1R5zW9LaTB.BuO','owner','+221771234567','active','2025-06-19 12:28:50'),(2,'Admin Test','admin@karangue221.com','$2b$10$1k5fPrWOcs8Oo.wHfj8eS.Vz6H0Vh02ARjPY2/t1R5zW9LaTB.BuO','admin','+221770000000','active','2025-06-19 12:28:50');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_assignments`
--

DROP TABLE IF EXISTS `vehicle_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehicle_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `driver_id` int NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` enum('active','ended') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  PRIMARY KEY (`id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `driver_id` (`driver_id`),
  KEY `idx_vehicle_assignments_vehicle_driver` (`vehicle_id`,`driver_id`),
  CONSTRAINT `fk_vehicle_assignments_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vehicle_assignments_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `vehicle_assignments_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  CONSTRAINT `vehicle_assignments_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_assignments`
--

LOCK TABLES `vehicle_assignments` WRITE;
/*!40000 ALTER TABLE `vehicle_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `vehicle_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_cameras`
--

DROP TABLE IF EXISTS `vehicle_cameras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehicle_cameras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `camera_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `serial_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `installation_date` date DEFAULT NULL,
  `status` enum('active','inactive','maintenance') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vehicle_cameras_vehicle` (`vehicle_id`),
  KEY `idx_vehicle_cameras_status` (`status`),
  CONSTRAINT `fk_vehicle_cameras_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_cameras`
--

LOCK TABLES `vehicle_cameras` WRITE;
/*!40000 ALTER TABLE `vehicle_cameras` DISABLE KEYS */;
/*!40000 ALTER TABLE `vehicle_cameras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehicles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `year` int DEFAULT NULL,
  `color` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','maintenance') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `fleet_id` int NOT NULL,
  `imei_device` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cameras` json DEFAULT NULL,
  `lastUpdate` datetime DEFAULT NULL,
  `last_maintenance_date` date DEFAULT NULL,
  `next_maintenance_date` date DEFAULT NULL,
  `fuel_type` enum('diesel','gasoline','electric','hybrid','other') COLLATE utf8mb4_unicode_ci DEFAULT 'diesel',
  `tank_capacity` decimal(8,2) DEFAULT NULL,
  `mileage` int DEFAULT '0',
  `insurance_expiry` date DEFAULT NULL,
  `technical_inspection_date` date DEFAULT NULL,
  `technical_inspection_expiry` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registration` (`registration`),
  KEY `fleet_id` (`fleet_id`),
  KEY `idx_vehicles_registration` (`registration`),
  KEY `idx_vehicles_next_maintenance` (`next_maintenance_date`),
  KEY `idx_vehicles_insurance_expiry` (`insurance_expiry`),
  KEY `idx_vehicles_technical_inspection_expiry` (`technical_inspection_expiry`),
  CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`fleet_id`) REFERENCES `fleets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `violation_types`
--

DROP TABLE IF EXISTS `violation_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `violation_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `severity` enum('low','medium','high') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `violation_types`
--

LOCK TABLES `violation_types` WRITE;
/*!40000 ALTER TABLE `violation_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `violation_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `violations`
--

DROP TABLE IF EXISTS `violations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `violations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `driver_id` int DEFAULT NULL,
  `vehicle_id` int DEFAULT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `violation_type_id` int DEFAULT NULL,
  `severity` enum('low','medium','high') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','confirmed','dismissed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `timestamp` datetime DEFAULT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `speed` int DEFAULT NULL,
  `speedLimit` int DEFAULT NULL,
  `gForce` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `eyeClosure` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lateralG` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hasVideo` tinyint(1) DEFAULT '0',
  `cost` int DEFAULT '0',
  `date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `driver_id` (`driver_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `idx_violations_type` (`violation_type_id`),
  KEY `idx_violations_timestamp` (`timestamp`),
  CONSTRAINT `fk_violations_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_violations_type` FOREIGN KEY (`violation_type_id`) REFERENCES `violation_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_violations_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `violations_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`),
  CONSTRAINT `violations_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `violations`
--

LOCK TABLES `violations` WRITE;
/*!40000 ALTER TABLE `violations` DISABLE KEYS */;
/*!40000 ALTER TABLE `violations` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_violation_insert` AFTER INSERT ON `violations` FOR EACH ROW BEGIN
  DECLARE current_score INT;
  DECLARE penalty INT;
  DECLARE new_trend VARCHAR(10);
  
  -- Set penalty based on severity
  CASE NEW.severity
    WHEN 'low' THEN SET penalty = 1;
    WHEN 'medium' THEN SET penalty = 3;
    WHEN 'high' THEN SET penalty = 5;
    ELSE SET penalty = 2;
  END CASE;
  
  -- Get current score
  SELECT overallScore INTO current_score FROM drivers WHERE id = NEW.driver_id;
  
  -- Calculate new trend
  IF current_score > (current_score - penalty) THEN
    SET new_trend = 'down';
  ELSE
    SET new_trend = 'stable';
  END IF;
  
  -- Update driver score
  UPDATE drivers 
  SET 
    overallScore = GREATEST(0, current_score - penalty),
    trend = new_trend
  WHERE id = NEW.driver_id;
  
  -- Insert into driver_scores_history
  INSERT INTO driver_scores_history (driver_id, score, evaluation_date, notes)
  VALUES (NEW.driver_id, GREATEST(0, current_score - penalty), CURDATE(), CONCAT('Violation penalty: ', penalty, ' points'));
  
  -- Create a notification for the fleet owner
  INSERT INTO notifications (user_id, type, message, timestamp)
  SELECT 
    u.id, 
    'violation', 
    CONCAT('New violation recorded for driver ', d.first_name, ' ', d.last_name, ': ', NEW.type), 
    NOW()
  FROM 
    drivers d
    JOIN fleets f ON d.fleet_id = f.id
    JOIN users u ON f.owner_id = u.id
  WHERE 
    d.id = NEW.driver_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping events for database 'karangue221'
--
/*!50106 SET @save_time_zone= @@TIME_ZONE */ ;
/*!50106 DROP EVENT IF EXISTS `daily_expiration_check_event` */;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `daily_expiration_check_event` ON SCHEDULE EVERY 1 DAY STARTS '2025-06-21 00:00:00' ON COMPLETION NOT PRESERVE ENABLE DO INSERT INTO notifications (type) VALUES ('daily_check') */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `daily_telemetry_archive` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `daily_telemetry_archive` ON SCHEDULE EVERY 1 DAY STARTS '2025-06-21 01:00:00' ON COMPLETION NOT PRESERVE ENABLE DO CALL archive_telemetry_data(90) */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `monthly_driver_score_calculation` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `monthly_driver_score_calculation` ON SCHEDULE EVERY 1 MONTH STARTS '2025-06-21 00:00:00' ON COMPLETION NOT PRESERVE ENABLE DO CALL calculate_driver_safety_scores() */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `monthly_telemetry_prune` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `monthly_telemetry_prune` ON SCHEDULE EVERY 1 MONTH STARTS '2025-06-21 02:00:00' ON COMPLETION NOT PRESERVE ENABLE DO CALL prune_telemetry_data(365) */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `weekly_maintenance_check` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `weekly_maintenance_check` ON SCHEDULE EVERY 1 WEEK STARTS '2025-06-21 00:00:00' ON COMPLETION NOT PRESERVE ENABLE DO CALL check_and_schedule_maintenance() */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
DELIMITER ;
/*!50106 SET TIME_ZONE= @save_time_zone */ ;

--
-- Dumping routines for database 'karangue221'
--
/*!50003 DROP PROCEDURE IF EXISTS `archive_telemetry_data` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `archive_telemetry_data`(IN archive_older_than_days INT)
BEGIN
  DECLARE archive_date DATE;
  DECLARE rows_affected INT;
  
  -- Calculate cutoff date
  SET archive_date = DATE_SUB(CURRENT_DATE(), INTERVAL archive_older_than_days DAY);
  
  SELECT CONCAT('MIGRATION LOG: Archiving telemetry data older than ', archive_date) AS log_message;
  
  -- Insert old records into archive table
  INSERT INTO telemetry_archive (
    id, vehicle_id, driver_id, timestamp, latitude, longitude, 
    speed, fuel_level, temperature, engine_temp, battery_level, 
    engine_status, acceleration, braking, heading, altitude, 
    ignition_status, created_at, archived
  )
  SELECT 
    id, vehicle_id, driver_id, timestamp, latitude, longitude, 
    speed, fuel_level, temperature, engine_temp, battery_level, 
    engine_status, acceleration, braking, heading, altitude, 
    ignition_status, created_at, TRUE
  FROM telemetry
  WHERE DATE(timestamp) < archive_date
    AND archived = FALSE;
  
  -- Get rows affected
  SET rows_affected = ROW_COUNT();
  
  -- Mark records as archived
  UPDATE telemetry 
  SET archived = TRUE
  WHERE DATE(timestamp) < archive_date
    AND archived = FALSE;
  
  -- Log result
  SELECT CONCAT('MIGRATION LOG: Archived ', rows_affected, ' telemetry records') AS log_message;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `assign_vehicle_to_driver` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `assign_vehicle_to_driver`(
  IN p_vehicle_id INT,
  IN p_driver_id INT
)
BEGIN
  DECLARE vehicle_exists INT;
  DECLARE driver_exists INT;
  DECLARE is_assigned INT;
  
  -- Check if vehicle exists
  SELECT COUNT(*) INTO vehicle_exists FROM vehicles WHERE id = p_vehicle_id;
  
  -- Check if driver exists
  SELECT COUNT(*) INTO driver_exists FROM drivers WHERE id = p_driver_id;
  
  -- Check if vehicle is already assigned
  SELECT COUNT(*) INTO is_assigned 
  FROM vehicle_assignments 
  WHERE vehicle_id = p_vehicle_id AND status = 'active';
  
  -- Validate inputs
  IF vehicle_exists = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Vehicle does not exist';
  ELSEIF driver_exists = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Driver does not exist';
  ELSEIF is_assigned > 0 THEN
    -- End the current assignment
    UPDATE vehicle_assignments
    SET status = 'ended', end_date = NOW()
    WHERE vehicle_id = p_vehicle_id AND status = 'active';
  END IF;
  
  -- Create new assignment
  INSERT INTO vehicle_assignments (vehicle_id, driver_id, start_date, status)
  VALUES (p_vehicle_id, p_driver_id, NOW(), 'active');
  
  -- Update driver record with current vehicle
  UPDATE drivers
  SET vehicle = (SELECT registration FROM vehicles WHERE id = p_vehicle_id)
  WHERE id = p_driver_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `calculate_driver_safety_scores` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `calculate_driver_safety_scores`()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE d_id INT;
  DECLARE violation_count INT;
  DECLARE avg_severity DECIMAL(3,2);
  DECLARE incident_count INT;
  DECLARE current_score INT;
  DECLARE new_score INT;
  DECLARE cur CURSOR FOR 
    SELECT 
      id 
    FROM 
      drivers;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  
  OPEN cur;
  
  read_loop: LOOP
    FETCH cur INTO d_id;
    IF done THEN
      LEAVE read_loop;
    END IF;
    
    -- Count violations in the last 3 months
    SELECT 
      COUNT(*),
      AVG(CASE 
            WHEN severity = 'low' THEN 1
            WHEN severity = 'medium' THEN 2
            WHEN severity = 'high' THEN 3
            ELSE 1.5
          END)
    INTO 
      violation_count, avg_severity
    FROM 
      violations
    WHERE 
      driver_id = d_id
      AND timestamp > DATE_SUB(NOW(), INTERVAL 3 MONTH);
      
    -- Count incidents in the last 3 months
    SELECT 
      COUNT(*)
    INTO 
      incident_count
    FROM 
      incidents
    WHERE 
      driver_id = d_id
      AND timestamp > DATE_SUB(NOW(), INTERVAL 3 MONTH);
    
    -- Get current score
    SELECT 
      overallScore
    INTO 
      current_score
    FROM 
      drivers
    WHERE 
      id = d_id;
    
    -- Calculate new score (100 - deductions)
    SET new_score = 100 - (violation_count * avg_severity * 2) - (incident_count * 5);
    
    -- Ensure score is between 0 and 100
    IF new_score < 0 THEN 
      SET new_score = 0;
    ELSEIF new_score > 100 THEN
      SET new_score = 100;
    END IF;
    
    -- Update driver score
    UPDATE drivers 
    SET 
      overallScore = new_score,
      trend = CASE 
                WHEN new_score > current_score THEN 'up'
                WHEN new_score < current_score THEN 'down'
                ELSE 'stable'
              END
    WHERE 
      id = d_id;
    
    -- Add to score history
    INSERT INTO driver_scores_history (driver_id, score, evaluation_date, notes)
    VALUES (d_id, new_score, CURDATE(), 'Automatic monthly safety score update');
    
  END LOOP;
  
  CLOSE cur;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `check_and_schedule_maintenance` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `check_and_schedule_maintenance`()
BEGIN
  -- Find vehicles that need maintenance based on time
  INSERT INTO maintenance_schedule (
    vehicle_id, maintenance_type, description, scheduled_date, status
  )
  SELECT 
    v.id,
    'Regular service',
    'Scheduled 3-month maintenance',
    DATE_ADD(CURDATE(), INTERVAL 7 DAY),
    'scheduled'
  FROM 
    vehicles v
  WHERE 
    v.next_maintenance_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)
    AND NOT EXISTS (
      SELECT 1 FROM maintenance_schedule ms 
      WHERE ms.vehicle_id = v.id 
      AND ms.status = 'scheduled'
    );
  
  -- Create notifications for the scheduled maintenance
  INSERT INTO notifications (user_id, type, message, timestamp)
  SELECT 
    u.id,
    'maintenance',
    CONCAT('Maintenance scheduled for vehicle ', v.registration, ' on ', 
           DATE_FORMAT(m.scheduled_date, '%Y-%m-%d')),
    NOW()
  FROM 
    maintenance_schedule m
    JOIN vehicles v ON m.vehicle_id = v.id
    JOIN fleets f ON v.fleet_id = f.id
    JOIN users u ON f.owner_id = u.id
  WHERE 
    m.status = 'scheduled'
    AND m.created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `create_index_if_not_exists` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `create_index_if_not_exists`(
    IN p_table_name VARCHAR(64),
    IN p_index_name VARCHAR(64),
    IN p_column_list VARCHAR(255)
)
BEGIN
    DECLARE index_exists INT;
    SELECT COUNT(*) INTO index_exists
    FROM information_schema.statistics
    WHERE table_schema = DATABASE() 
    AND table_name = p_table_name 
    AND index_name = p_index_name
    LIMIT 1;
    IF index_exists = 0 THEN
        SET @sql = CONCAT('CREATE INDEX ', p_index_name, ' ON ', p_table_name, '(', p_column_list, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('MIGRATION LOG: Created index ', p_index_name, ' on table ', p_table_name) AS log_message;
    ELSE
        SELECT CONCAT('MIGRATION LOG: Index ', p_index_name, ' already exists on table ', p_table_name) AS log_message;
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `generate_vehicle_report` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `generate_vehicle_report`(
  IN p_vehicle_id INT,
  IN p_start_date DATE,
  IN p_end_date DATE
)
BEGIN
  -- Get vehicle details
  SELECT 
    v.id, v.registration, v.brand, v.model, v.status,
    f.name AS fleet_name
  FROM 
    vehicles v
    JOIN fleets f ON v.fleet_id = f.id
  WHERE 
    v.id = p_vehicle_id;
  
  -- Get driver assignments
  SELECT 
    va.id, va.start_date, va.end_date, va.status,
    d.id AS driver_id, CONCAT(d.first_name, ' ', d.last_name) AS driver_name
  FROM 
    vehicle_assignments va
    JOIN drivers d ON va.driver_id = d.id
  WHERE 
    va.vehicle_id = p_vehicle_id
    AND (va.start_date BETWEEN p_start_date AND p_end_date
         OR va.end_date BETWEEN p_start_date AND p_end_date
         OR (va.start_date <= p_start_date AND (va.end_date >= p_end_date OR va.end_date IS NULL)))
  ORDER BY 
    va.start_date DESC;
  
  -- Get violations
  SELECT 
    v.id, v.type, v.severity, v.timestamp, v.location, v.speed, v.speedLimit,
    CONCAT(d.first_name, ' ', d.last_name) AS driver_name
  FROM 
    violations v
    LEFT JOIN drivers d ON v.driver_id = d.id
  WHERE 
    v.vehicle_id = p_vehicle_id
    AND v.timestamp BETWEEN p_start_date AND p_end_date
  ORDER BY 
    v.timestamp DESC;
  
  -- Get incidents
  SELECT 
    i.id, i.type, i.description, i.severity, i.status, i.timestamp,
    CONCAT(d.first_name, ' ', d.last_name) AS driver_name
  FROM 
    incidents i
    LEFT JOIN drivers d ON i.driver_id = d.id
  WHERE 
    i.vehicle_id = p_vehicle_id
    AND i.timestamp BETWEEN p_start_date AND p_end_date
  ORDER BY 
    i.timestamp DESC;
  
  -- Get maintenance records
  SELECT 
    m.id, m.maintenance_type, m.description, m.scheduled_date, m.completed_date,
    m.cost, m.status
  FROM 
    maintenance_schedule m
  WHERE 
    m.vehicle_id = p_vehicle_id
    AND (m.scheduled_date BETWEEN p_start_date AND p_end_date
         OR m.completed_date BETWEEN p_start_date AND p_end_date)
  ORDER BY 
    COALESCE(m.completed_date, m.scheduled_date) DESC;
  
  -- Get telemetry summary
  SELECT 
    COUNT(*) AS data_points,
    MIN(timestamp) AS first_data,
    MAX(timestamp) AS last_data,
    AVG(speed) AS avg_speed,
    MAX(speed) AS max_speed,
    AVG(fuel_level) AS avg_fuel_level
  FROM 
    telemetry
  WHERE 
    vehicle_id = p_vehicle_id
    AND timestamp BETWEEN p_start_date AND p_end_date;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_telemetry_data` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_telemetry_data`(
  IN p_vehicle_id INT,
  IN p_start_date DATETIME,
  IN p_end_date DATETIME
)
BEGIN
  -- First check current table
  SELECT * FROM telemetry
  WHERE vehicle_id = p_vehicle_id
    AND timestamp BETWEEN p_start_date AND p_end_date
  
  UNION ALL
  
  -- Then check archive table
  SELECT * FROM telemetry_archive
  WHERE vehicle_id = p_vehicle_id
    AND timestamp BETWEEN p_start_date AND p_end_date
  
  ORDER BY timestamp;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `prune_telemetry_data` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `prune_telemetry_data`(IN retention_days INT)
BEGIN
  DECLARE prune_date DATE;
  DECLARE rows_affected INT;
  
  -- Calculate retention date
  SET prune_date = DATE_SUB(CURRENT_DATE(), INTERVAL retention_days DAY);
  
  SELECT CONCAT('MIGRATION LOG: Pruning archived telemetry data older than ', prune_date) AS log_message;
  
  -- Delete old archived records
  DELETE FROM telemetry
  WHERE DATE(timestamp) < prune_date
    AND archived = TRUE;
  
  -- Get rows affected
  SET rows_affected = ROW_COUNT();
  
  -- Log result
  SELECT CONCAT('MIGRATION LOG: Pruned ', rows_affected, ' telemetry records') AS log_message;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `active_vehicle_status`
--

/*!50001 DROP VIEW IF EXISTS `active_vehicle_status`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `active_vehicle_status` AS select `v`.`id` AS `vehicle_id`,`v`.`registration` AS `registration`,`v`.`brand` AS `brand`,`v`.`model` AS `model`,`v`.`fleet_id` AS `fleet_id`,`f`.`name` AS `fleet_name`,`d`.`id` AS `driver_id`,concat(`d`.`first_name`,' ',`d`.`last_name`) AS `driver_name`,`t`.`timestamp` AS `last_update`,`t`.`latitude` AS `latitude`,`t`.`longitude` AS `longitude`,`t`.`speed` AS `speed`,`t`.`fuel_level` AS `fuel_level`,`t`.`ignition_status` AS `ignition_status`,`t`.`engine_status` AS `engine_status` from ((((`vehicles` `v` join `fleets` `f` on((`v`.`fleet_id` = `f`.`id`))) left join (select `va`.`vehicle_id` AS `vehicle_id`,`va`.`driver_id` AS `driver_id` from `vehicle_assignments` `va` where (`va`.`status` = 'active')) `current_assignment` on((`v`.`id` = `current_assignment`.`vehicle_id`))) left join `drivers` `d` on((`current_assignment`.`driver_id` = `d`.`id`))) left join (select `t1`.`vehicle_id` AS `vehicle_id`,`t1`.`timestamp` AS `timestamp`,`t1`.`latitude` AS `latitude`,`t1`.`longitude` AS `longitude`,`t1`.`speed` AS `speed`,`t1`.`fuel_level` AS `fuel_level`,`t1`.`ignition_status` AS `ignition_status`,`t1`.`engine_status` AS `engine_status` from (`telemetry` `t1` join (select `telemetry`.`vehicle_id` AS `vehicle_id`,max(`telemetry`.`timestamp`) AS `max_timestamp` from `telemetry` group by `telemetry`.`vehicle_id`) `t2` on(((`t1`.`vehicle_id` = `t2`.`vehicle_id`) and (`t1`.`timestamp` = `t2`.`max_timestamp`))))) `t` on((`v`.`id` = `t`.`vehicle_id`))) where (`v`.`status` = 'active') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `dashboard_summary`
--

/*!50001 DROP VIEW IF EXISTS `dashboard_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `dashboard_summary` AS select `f`.`id` AS `fleet_id`,`f`.`name` AS `fleet_name`,count(distinct `v`.`id`) AS `total_vehicles`,sum((case when (`v`.`status` = 'active') then 1 else 0 end)) AS `active_vehicles`,sum((case when (`v`.`status` = 'maintenance') then 1 else 0 end)) AS `maintenance_vehicles`,sum((case when (`v`.`status` = 'inactive') then 1 else 0 end)) AS `inactive_vehicles`,count(distinct `d`.`id`) AS `total_drivers`,sum((case when (`d`.`status` = 'active') then 1 else 0 end)) AS `active_drivers`,sum((case when (`d`.`status` = 'inactive') then 1 else 0 end)) AS `inactive_drivers`,count(distinct `i`.`id`) AS `total_incidents`,sum((case when (`i`.`status` = 'open') then 1 else 0 end)) AS `open_incidents`,count(distinct `vio`.`id`) AS `total_violations` from ((((`fleets` `f` left join `vehicles` `v` on((`f`.`id` = `v`.`fleet_id`))) left join `drivers` `d` on((`f`.`id` = `d`.`fleet_id`))) left join `incidents` `i` on((`v`.`id` = `i`.`vehicle_id`))) left join `violations` `vio` on((`v`.`id` = `vio`.`vehicle_id`))) group by `f`.`id`,`f`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `driver_performance`
--

/*!50001 DROP VIEW IF EXISTS `driver_performance`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `driver_performance` AS select `d`.`id` AS `driver_id`,concat(`d`.`first_name`,' ',`d`.`last_name`) AS `driver_name`,`d`.`fleet_id` AS `fleet_id`,`f`.`name` AS `fleet_name`,`d`.`overallScore` AS `current_score`,`d`.`trend` AS `trend`,coalesce(count(`vio`.`id`),0) AS `violation_count`,coalesce(`dsh`.`avg_score`,0) AS `average_score`,`v`.`registration` AS `current_vehicle`,concat(`v`.`brand`,' ',`v`.`model`) AS `vehicle_model` from (((((`drivers` `d` join `fleets` `f` on((`d`.`fleet_id` = `f`.`id`))) left join `violations` `vio` on(((`d`.`id` = `vio`.`driver_id`) and (`vio`.`timestamp` > (now() - interval 30 day))))) left join (select `driver_scores_history`.`driver_id` AS `driver_id`,avg(`driver_scores_history`.`score`) AS `avg_score` from `driver_scores_history` where (`driver_scores_history`.`evaluation_date` > (now() - interval 6 month)) group by `driver_scores_history`.`driver_id`) `dsh` on((`d`.`id` = `dsh`.`driver_id`))) left join (select `vehicle_assignments`.`vehicle_id` AS `vehicle_id`,`vehicle_assignments`.`driver_id` AS `driver_id` from `vehicle_assignments` where (`vehicle_assignments`.`status` = 'active')) `va` on((`d`.`id` = `va`.`driver_id`))) left join `vehicles` `v` on((`va`.`vehicle_id` = `v`.`id`))) group by `d`.`id`,`d`.`first_name`,`d`.`last_name`,`d`.`fleet_id`,`f`.`name`,`d`.`overallScore`,`d`.`trend`,`dsh`.`avg_score`,`v`.`registration`,`v`.`brand`,`v`.`model` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `maintenance_due`
--

/*!50001 DROP VIEW IF EXISTS `maintenance_due`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `maintenance_due` AS select `v`.`id` AS `vehicle_id`,`v`.`registration` AS `registration`,`v`.`brand` AS `brand`,`v`.`model` AS `model`,`v`.`fleet_id` AS `fleet_id`,`f`.`name` AS `fleet_name`,`v`.`last_maintenance_date` AS `last_maintenance_date`,`v`.`next_maintenance_date` AS `next_maintenance_date`,`v`.`insurance_expiry` AS `insurance_expiry`,`v`.`technical_inspection_expiry` AS `technical_inspection_expiry`,(case when (`v`.`next_maintenance_date` <= (curdate() + interval 7 day)) then 'urgent' when (`v`.`next_maintenance_date` <= (curdate() + interval 30 day)) then 'upcoming' else 'scheduled' end) AS `maintenance_status`,(case when (`v`.`insurance_expiry` <= (curdate() + interval 7 day)) then 'urgent' when (`v`.`insurance_expiry` <= (curdate() + interval 30 day)) then 'upcoming' else 'valid' end) AS `insurance_status`,(case when (`v`.`technical_inspection_expiry` <= (curdate() + interval 7 day)) then 'urgent' when (`v`.`technical_inspection_expiry` <= (curdate() + interval 30 day)) then 'upcoming' else 'valid' end) AS `inspection_status` from (`vehicles` `v` join `fleets` `f` on((`v`.`fleet_id` = `f`.`id`))) where ((`v`.`next_maintenance_date` <= (curdate() + interval 30 day)) or (`v`.`insurance_expiry` <= (curdate() + interval 30 day)) or (`v`.`technical_inspection_expiry` <= (curdate() + interval 30 day))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `recent_violations`
--

/*!50001 DROP VIEW IF EXISTS `recent_violations`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `recent_violations` AS select `vio`.`id` AS `violation_id`,`vio`.`driver_id` AS `driver_id`,concat(`d`.`first_name`,' ',`d`.`last_name`) AS `driver_name`,`vio`.`vehicle_id` AS `vehicle_id`,`v`.`registration` AS `registration`,`vio`.`type` AS `violation_type`,`vio`.`severity` AS `severity`,`vio`.`timestamp` AS `timestamp`,`vio`.`location` AS `location`,`vio`.`speed` AS `speed`,`vio`.`speedLimit` AS `speedLimit`,`vio`.`status` AS `status` from ((`violations` `vio` left join `drivers` `d` on((`vio`.`driver_id` = `d`.`id`))) left join `vehicles` `v` on((`vio`.`vehicle_id` = `v`.`id`))) where (`vio`.`timestamp` > (now() - interval 30 day)) order by `vio`.`timestamp` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-20 17:00:35
