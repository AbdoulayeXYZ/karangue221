ALTER TABLE vehicles
ADD COLUMN insurance_provider VARCHAR(100) NULL,
ADD COLUMN policy_number VARCHAR(50) NULL,
ADD COLUMN engine_details VARCHAR(100) NULL,
ADD COLUMN vin_number VARCHAR(17) NULL,
ADD COLUMN passenger_capacity VARCHAR(50) NULL,
ADD COLUMN insurance_coverage_type VARCHAR(50) NULL;
