-- database/seed.sql

-- Clear existing data
TRUNCATE TABLE visa_bulletin_history, dol_processing_history, prediction_cache RESTART IDENTITY CASCADE;

-- Insert Visa Bulletin History (Sample data to simulate movement UI and graphs)
-- Assuming current month is 2024-03-01
-- Month 1: Jan 2024
INSERT INTO visa_bulletin_history (category, country, final_action_date, filing_date, bulletin_month, movement_days)
VALUES 
('EB2', 'India', '2012-03-01', '2012-05-15', '2024-01-01', 0),
('EB2', 'ROW', '2022-11-01', '2023-01-01', '2024-01-01', 0),
('EB3', 'India', '2012-06-01', '2012-08-01', '2024-01-01', 0);

-- Month 2: Feb 2024
INSERT INTO visa_bulletin_history (category, country, final_action_date, filing_date, bulletin_month, movement_days)
VALUES 
('EB2', 'India', '2012-03-01', '2012-05-15', '2024-02-01', 0),
('EB2', 'ROW', '2022-11-15', '2023-01-15', '2024-02-01', 14),
('EB3', 'India', '2012-07-01', '2012-08-01', '2024-02-01', 30);

-- Month 3: Mar 2024
INSERT INTO visa_bulletin_history (category, country, final_action_date, filing_date, bulletin_month, movement_days)
VALUES 
('EB2', 'India', '2012-04-01', '2012-06-01', '2024-03-01', 31),
('EB2', 'ROW', '2022-11-22', '2023-01-15', '2024-03-01', 7),
('EB3', 'India', '2012-07-01', '2012-08-01', '2024-03-01', 0);

-- Wait, let's add an example of Retrogression for EB3 China as a warning example
INSERT INTO visa_bulletin_history (category, country, final_action_date, filing_date, bulletin_month, movement_days)
VALUES
('EB3', 'China', '2020-09-01', '2021-07-01', '2024-01-01', 0),
('EB3', 'China', '2020-09-01', '2021-07-01', '2024-02-01', 0),
('EB3', 'China', '2020-01-01', '2020-11-01', '2024-03-01', -244); -- Retrogression event

-- Insert DOL PERM Processing History
INSERT INTO dol_processing_history (analyst_review_month, audit_review_month, pwd_month, update_month)
VALUES
('2023-02-01', '2022-12-01', '2023-08-01', '2024-01-01'),
('2023-03-01', '2023-01-01', '2023-09-01', '2024-02-01'),
('2023-04-01', '2023-01-15', '2023-09-15', '2024-03-01');

-- Insert Prediction Cache
INSERT INTO prediction_cache (category, country, avg_monthly_movement_days, regression_slope, confidence_level, estimated_months_to_current)
VALUES
('EB2', 'India', 10.33, 0.5, 'Medium', 140.5),
('EB2', 'ROW', 7.00, 0.4, 'Low', 15.2),
('EB3', 'India', 10.00, 0.1, 'Low', 137.4),
('EB3', 'China', -81.33, -2.5, 'Low', 60.0);
