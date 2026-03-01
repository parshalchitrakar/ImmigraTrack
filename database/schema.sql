-- database/schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Visa Bulletin History
CREATE TABLE IF NOT EXISTS visa_bulletin_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL, -- e.g., 'EB1', 'EB2', 'EB3'
    country VARCHAR(50) NOT NULL, -- e.g., 'India', 'China', 'ROW'
    final_action_date DATE, -- NULL can represent 'Current'
    is_current_final_action BOOLEAN DEFAULT false,
    filing_date DATE,
    is_current_filing BOOLEAN DEFAULT false,
    bulletin_month DATE NOT NULL, -- The month the bulletin is valid for
    movement_days INTEGER, -- Days moved compared to previous month
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, country, bulletin_month)
);

-- Crucial Index for performance (Architect requirement)
CREATE INDEX IF NOT EXISTS idx_category_country_month ON visa_bulletin_history(category, country, bulletin_month);

-- 2. DOL PERM Processing History
CREATE TABLE IF NOT EXISTS dol_processing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analyst_review_month DATE NOT NULL, -- The priority month they are processing
    audit_review_month DATE NOT NULL,
    pwd_month DATE NOT NULL, -- Prevailing wage determination month
    update_month DATE NOT NULL, -- The month this update was published
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(update_month)
);

-- 3. Prediction Cache & Analytics
CREATE TABLE IF NOT EXISTS prediction_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    avg_monthly_movement_days NUMERIC(10, 2),
    regression_slope NUMERIC(10, 4),
    confidence_level VARCHAR(20), -- 'High', 'Medium', 'Low'
    estimated_months_to_current NUMERIC(10, 1),
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, country)
);

-- 4. Users (Future Ready)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    selected_category VARCHAR(50),
    selected_country VARCHAR(50),
    priority_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
