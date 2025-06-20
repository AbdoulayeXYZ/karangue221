#!/bin/bash

# -----------------------------------------------------------------------
# Database Migration Script for Karangue221
# Created: 2025-06-20
# -----------------------------------------------------------------------
# This script performs a safe migration of the database structure by:
# 1. Creating a full backup of the current database
# 2. Executing migrations in order
# 3. Validating data integrity after each migration
# 4. Providing rollback capability in case of failure
# -----------------------------------------------------------------------

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "ERROR: .env file not found!"
  exit 1
fi

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-root}
DB_PASS=${DB_PASS:-""}
DB_NAME=${DB_NAME:-karangue221}
BACKUP_DIR="./database_backups"
MIGRATION_DIR="./migrations"
LOG_FILE="./database_migration.log"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${TIMESTAMP}.sql"

# MySQL connection parameters
MYSQL_CONN="-h${DB_HOST} -u${DB_USER}"
if [ ! -z "$DB_PASS" ]; then
  MYSQL_CONN="$MYSQL_CONN -p${DB_PASS}"
fi

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# -----------------------------------------------------------------------
# Helper functions
# -----------------------------------------------------------------------

# Log messages to file and console
log() {
  local level=$1
  local message=$2
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  
  echo -e "${timestamp} [${level}] ${message}" >> ${LOG_FILE}
  
  case $level in
    "INFO")
      echo -e "${BLUE}${timestamp} [${level}] ${message}${NC}"
      ;;
    "SUCCESS")
      echo -e "${GREEN}${timestamp} [${level}] ${message}${NC}"
      ;;
    "WARNING")
      echo -e "${YELLOW}${timestamp} [${level}] ${message}${NC}"
      ;;
    "ERROR")
      echo -e "${RED}${timestamp} [${level}] ${message}${NC}"
      ;;
    *)
      echo -e "${timestamp} [${level}] ${message}"
      ;;
  esac
}

# Create directory if it doesn't exist
create_dir_if_not_exists() {
  if [ ! -d "$1" ]; then
    mkdir -p "$1"
    log "INFO" "Created directory: $1"
  fi
}

# Backup the entire database
backup_database() {
  log "INFO" "Creating full database backup to ${BACKUP_FILE}..."
  create_dir_if_not_exists "${BACKUP_DIR}"
  
  mysqldump ${MYSQL_CONN} --opt --routines --triggers --events --set-gtid-purged=OFF ${DB_NAME} > "${BACKUP_FILE}"
  
  if [ $? -eq 0 ]; then
    log "SUCCESS" "Database backup created successfully"
    # Create a small backup verification file
    echo "BACKUP_TIMESTAMP=${TIMESTAMP}" > "${BACKUP_DIR}/backup_${TIMESTAMP}.info"
    echo "BACKUP_FILE=${BACKUP_FILE}" >> "${BACKUP_DIR}/backup_${TIMESTAMP}.info"
    echo "DB_NAME=${DB_NAME}" >> "${BACKUP_DIR}/backup_${TIMESTAMP}.info"
    return 0
  else
    log "ERROR" "Failed to create database backup"
    return 1
  fi
}

# Check if a table exists
table_exists() {
  local table_name=$1
  local count=$(mysql ${MYSQL_CONN} -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}' AND table_name='${table_name}';")
  
  if [ "$count" -gt 0 ]; then
    return 0
  else
    return 1
  fi
}

# Validate data integrity after migration
validate_data() {
  local phase=$1
  
  log "INFO" "Validating data integrity after phase ${phase}..."
  
  case $phase in
    1)
      # Phase 1 validation - check if reference tables were created and redundancy fixed
      if ! table_exists "violation_types"; then
        log "ERROR" "Validation failed: violation_types table does not exist"
        return 1
      fi
      
      if ! table_exists "incident_types"; then
        log "ERROR" "Validation failed: incident_types table does not exist"
        return 1
      fi
      
      # Check if telemetry table has the expected structure
      log "INFO" "Validating telemetry table structure..."
      
      # Print the current telemetry table structure for debugging
      mysql ${MYSQL_CONN} -e "DESCRIBE ${DB_NAME}.telemetry;" > telemetry_structure_debug.txt
      log "INFO" "Current telemetry structure saved to telemetry_structure_debug.txt"
      
      # Count the total columns in telemetry table
      local column_count=$(mysql ${MYSQL_CONN} -N -e "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='${DB_NAME}' AND table_name='telemetry';")
      log "INFO" "Telemetry table has ${column_count} columns"
      
      # Check that we have the expected columns (adjust this count if needed)
      if [ "$column_count" -lt 8 ] || [ "$column_count" -gt 10 ]; then
        log "ERROR" "Validation failed: telemetry table has unexpected number of columns (${column_count})"
        return 1
      fi
      
      # Check for required columns
      local required_columns=$(mysql ${MYSQL_CONN} -N -e "
        SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_schema='${DB_NAME}' 
        AND table_name='telemetry' 
        AND column_name IN ('id', 'vehicle_id', 'timestamp', 'latitude', 'longitude', 'speed');")
      
      if [ "$required_columns" -lt 6 ]; then
        log "ERROR" "Validation failed: telemetry table is missing required columns (found ${required_columns}/6)"
        return 1
      fi
      
      # Check if we have any duplicate columns (with underscore prefix)
      local duplicate_columns=$(mysql ${MYSQL_CONN} -N -e "
        SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_schema='${DB_NAME}' 
        AND table_name='telemetry' 
        AND column_name LIKE '\_%';")
      
      if [ "$duplicate_columns" -gt 0 ]; then
        log "ERROR" "Validation failed: telemetry table has ${duplicate_columns} duplicate columns with underscore prefix"
        return 1
      fi
      
      log "INFO" "Telemetry table structure validation passed"
      
      log "SUCCESS" "Phase 1 validation successful"
      ;;
      
    2)
      # Phase 2 validation - check if new tables were created and columns added
      if ! table_exists "maintenance_schedule"; then
        log "ERROR" "Validation failed: maintenance_schedule table does not exist"
        return 1
      fi
      
      if ! table_exists "driver_scores_history"; then
        log "ERROR" "Validation failed: driver_scores_history table does not exist"
        return 1
      fi
      
      if ! table_exists "vehicle_cameras"; then
        log "ERROR" "Validation failed: vehicle_cameras table does not exist"
        return 1
      fi
      
      # Check if vehicles table has new columns
      local vehicle_columns=$(mysql ${MYSQL_CONN} -N -e "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='${DB_NAME}' AND table_name='vehicles' AND column_name IN ('fuel_type', 'tank_capacity', 'insurance_expiry');")
      
      if [ "$vehicle_columns" -lt 3 ]; then
        log "ERROR" "Validation failed: new columns not added to vehicles table"
        return 1
      fi
      
      log "SUCCESS" "Phase 2 validation successful"
      ;;
      
    3)
      # Phase 3 validation - check if partitioned telemetry and views were created
      if ! table_exists "telemetry"; then
        log "ERROR" "Validation failed: telemetry table does not exist"
        return 1
      fi
      
      # Check if archive table is set up
      if ! table_exists "telemetry_archive"; then
        log "ERROR" "Validation failed: telemetry_archive table does not exist"
        return 1
      fi
      
      # Check if archiving procedures are set up
      local proc_count=$(mysql ${MYSQL_CONN} -N -e "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema='${DB_NAME}' AND routine_name IN ('archive_telemetry_data', 'prune_telemetry_data', 'get_telemetry_data');")
      
      if [ "$proc_count" -lt 3 ]; then
        log "ERROR" "Validation failed: telemetry management procedures were not created properly (found ${proc_count}/3)"
        return 1
      fi
      
      # Check if views were created
      local view_count=$(mysql ${MYSQL_CONN} -N -e "SELECT COUNT(*) FROM information_schema.views WHERE table_schema='${DB_NAME}' AND table_name IN ('dashboard_summary', 'active_vehicle_status', 'driver_performance');")
      
      if [ "$view_count" -lt 3 ]; then
        log "ERROR" "Validation failed: required views were not created"
        return 1
      fi
      
      # Check if events were created
      local event_count=$(mysql ${MYSQL_CONN} -N -e "SELECT COUNT(*) FROM information_schema.events WHERE event_schema='${DB_NAME}';")
      
      if [ "$event_count" -lt 2 ]; then
        log "WARNING" "Some scheduled events may not have been created correctly"
      fi
      
      log "SUCCESS" "Phase 3 validation successful"
      ;;
      
    *)
      log "ERROR" "Unknown validation phase: ${phase}"
      return 1
      ;;
  esac
  
  return 0
}

# Execute a SQL migration file
execute_migration() {
  local migration_file=$1
  local phase=$2
  
  log "INFO" "Executing migration phase ${phase}: ${migration_file}..."
  
  mysql ${MYSQL_CONN} ${DB_NAME} < "${migration_file}"
  
  if [ $? -eq 0 ]; then
    log "SUCCESS" "Migration phase ${phase} completed successfully"
    return 0
  else
    log "ERROR" "Migration phase ${phase} failed"
    return 1
  fi
}

# Restore database from backup
restore_from_backup() {
  local backup_file=$1
  
  log "WARNING" "Restoring database from backup: ${backup_file}..."
  
  mysql ${MYSQL_CONN} ${DB_NAME} < "${backup_file}"
  
  if [ $? -eq 0 ]; then
    log "SUCCESS" "Database restored successfully from backup"
    return 0
  else
    log "ERROR" "Failed to restore database from backup"
    return 1
  fi
}

# -----------------------------------------------------------------------
# Main migration process
# -----------------------------------------------------------------------

main() {
  log "INFO" "Starting database migration process..."
  
  # Create migration directories if they don't exist
  create_dir_if_not_exists "${BACKUP_DIR}"
  create_dir_if_not_exists "${MIGRATION_DIR}"
  
  # Check if migration files exist
  if [ ! -f "${MIGRATION_DIR}/01_fix_redundancy_and_add_reference_tables.sql" ]; then
    log "ERROR" "Migration file not found: 01_fix_redundancy_and_add_reference_tables.sql"
    exit 1
  fi
  
  if [ ! -f "${MIGRATION_DIR}/02_add_new_tables_and_enhance_existing.sql" ]; then
    log "ERROR" "Migration file not found: 02_add_new_tables_and_enhance_existing.sql"
    exit 1
  fi
  
  if [ ! -f "${MIGRATION_DIR}/03_add_partitioning_views_triggers.sql" ]; then
    log "ERROR" "Migration file not found: 03_add_partitioning_views_triggers.sql"
    exit 1
  fi
  
  # Backup the database
  backup_database
  if [ $? -ne 0 ]; then
    log "ERROR" "Migration aborted due to backup failure"
    exit 1
  fi
  
  # Record migration start in database
  mysql ${MYSQL_CONN} -e "CREATE TABLE IF NOT EXISTS ${DB_NAME}.migration_history (id INT AUTO_INCREMENT PRIMARY KEY, phase INT, timestamp DATETIME, status VARCHAR(20), backup_file VARCHAR(255));"
  mysql ${MYSQL_CONN} -e "INSERT INTO ${DB_NAME}.migration_history (phase, timestamp, status, backup_file) VALUES (0, NOW(), 'started', '${BACKUP_FILE}');"
  
  # Phase 1: Fix redundancy and add reference tables
  log "INFO" "Starting migration phase 1..."
  execute_migration "${MIGRATION_DIR}/01_fix_redundancy_and_add_reference_tables.sql" 1
  
  if [ $? -eq 0 ]; then
    validate_data 1
    if [ $? -ne 0 ]; then
      log "ERROR" "Phase 1 validation failed, rolling back to backup"
      restore_from_backup "${BACKUP_FILE}"
      mysql ${MYSQL_CONN} -e "UPDATE ${DB_NAME}.migration_history SET status = 'rolled_back' WHERE phase = 0 AND backup_file = '${BACKUP_FILE}';"
      exit 1
    fi
    mysql ${MYSQL_CONN} -e "INSERT INTO ${DB_NAME}.migration_history (phase, timestamp, status, backup_file) VALUES (1, NOW(), 'completed', '${BACKUP_FILE}');"
  else
    log "ERROR" "Phase 1 migration failed, rolling back to backup"
    restore_from_backup "${BACKUP_FILE}"
    mysql ${MYSQL_CONN} -e "UPDATE ${DB_NAME}.migration_history SET status = 'rolled_back' WHERE phase = 0 AND backup_file = '${BACKUP_FILE}';"
    exit 1
  fi
  
  # Phase 2: Add new tables and enhance existing ones
  log "INFO" "Starting migration phase 2..."
  execute_migration "${MIGRATION_DIR}/02_add_new_tables_and_enhance_existing.sql" 2
  
  if [ $? -eq 0 ]; then
    validate_data 2
    if [ $? -ne 0 ]; then
      log "ERROR" "Phase 2 validation failed, rolling back to backup"
      restore_from_backup "${BACKUP_FILE}"
      mysql ${MYSQL_CONN} -e "UPDATE ${DB_NAME}.migration_history SET status = 'rolled_back' WHERE phase = 0 AND backup_file = '${BACKUP_FILE}';"
      exit 1
    fi
    mysql ${MYSQL_CONN} -e "INSERT INTO ${DB_NAME}.migration_history (phase, timestamp, status, backup_file) VALUES (2, NOW(), 'completed', '${BACKUP_FILE}');"
  else
    log "ERROR" "Phase 2 migration failed, rolling back to backup"
    restore_from_backup "${BACKUP_FILE}"
    mysql ${MYSQL_CONN} -e "UPDATE ${DB_NAME}.migration_history SET status = 'rolled_back' WHERE phase = 0 AND backup_file = '${BACKUP_FILE}';"
    exit 1
  fi
  
  # Phase 3: Add partitioning, views, and triggers
  log "INFO" "Starting migration phase 3..."
  execute_migration "${MIGRATION_DIR}/03_add_partitioning_views_triggers.sql" 3
  
  if [ $? -eq 0 ]; then
    validate_data 3
    if [ $? -ne 0 ]; then
      log "ERROR" "Phase 3 validation failed, rolling back to backup"
      restore_from_backup "${BACKUP_FILE}"
      mysql ${MYSQL_CONN} -e "UPDATE ${DB_NAME}.migration_history SET status = 'rolled_back' WHERE phase = 0 AND backup_file = '${BACKUP_FILE}';"
      exit 1
    fi
    mysql ${MYSQL_CONN} -e "INSERT INTO ${DB_NAME}.migration_history (phase, timestamp, status, backup_file) VALUES (3, NOW(), 'completed', '${BACKUP_FILE}');"
  else
    log "ERROR" "Phase 3 migration failed, rolling back to backup"
    restore_from_backup "${BACKUP_FILE}"
    mysql ${MYSQL_CONN} -e "UPDATE ${DB_NAME}.migration_history SET status = 'rolled_back' WHERE phase = 0 AND backup_file = '${BACKUP_FILE}';"
    exit 1
  fi
  
  # Record successful migration completion
  mysql ${MYSQL_CONN} -e "UPDATE ${DB_NAME}.migration_history SET status = 'completed' WHERE phase = 0 AND backup_file = '${BACKUP_FILE}';"
  
  log "SUCCESS" "Database migration completed successfully!"
  log "INFO" "Backup file: ${BACKUP_FILE}"
  
  # Provide instructions for manual validation
  echo -e "\n${GREEN}===== Migration Complete =====${NC}"
  echo -e "The database has been successfully migrated to the new structure."
  echo -e "To manually validate the migration, run these commands:"
  echo -e "  - ${BLUE}mysql ${DB_NAME} -e 'SHOW TABLES;'${NC}"
  echo -e "  - ${BLUE}mysql ${DB_NAME} -e 'SHOW VIEWS;'${NC}"
  echo -e "  - ${BLUE}mysql ${DB_NAME} -e 'SHOW EVENTS;'${NC}"
  echo -e "  - ${BLUE}mysql ${DB_NAME} -e 'SHOW TRIGGERS;'${NC}"
  echo -e "\nIf you need to restore from backup, run:"
  echo -e "  ${BLUE}mysql ${DB_NAME} < ${BACKUP_FILE}${NC}"
  echo -e "\n${GREEN}=============================${NC}"
}

# -----------------------------------------------------------------------
# Execute the main function
# -----------------------------------------------------------------------

main
