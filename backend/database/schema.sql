-- ============================================================
-- CloudWatch Sentinel — Supabase PostgreSQL Database Schema
-- ============================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cloud Accounts Table
CREATE TABLE IF NOT EXISTS public.cloud_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    role_arn VARCHAR(512) NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    aws_region VARCHAR(64) DEFAULT 'us-east-1',
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Cloud Resources Table
CREATE TABLE IF NOT EXISTS public.cloud_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    resource_name VARCHAR(255),
    service VARCHAR(128) NOT NULL,
    region VARCHAR(64) DEFAULT 'us-east-1',
    status VARCHAR(32) DEFAULT 'running',
    tags JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Metric Samples Table
CREATE TABLE IF NOT EXISTS public.metric_samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    metric_name VARCHAR(128) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(32) DEFAULT 'Percent',
    source VARCHAR(32) DEFAULT 'demo',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Cost Records Table
CREATE TABLE IF NOT EXISTS public.cost_records (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    service VARCHAR(128) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    source VARCHAR(32) DEFAULT 'demo',
    collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Anomalies Table
CREATE TABLE IF NOT EXISTS public.anomalies (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    anomaly_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    service VARCHAR(128) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    baseline DOUBLE PRECISION NOT NULL,
    z_score DOUBLE PRECISION NOT NULL,
    severity VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Alerts & Notifications Table
CREATE TABLE IF NOT EXISTS public.alerts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    notification_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(32) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Collection Runs Table
CREATE TABLE IF NOT EXISTS public.collection_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL,
    records_processed INT DEFAULT 0,
    anomalies_detected INT DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 9. Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    monthly_limit DOUBLE PRECISION NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    alert_threshold_percent INT DEFAULT 80,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Audit Events Table
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(128) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) policies for Supabase
ALTER TABLE public.cloud_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Enable Realtime publication for tables
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.cost_records, public.anomalies, public.alerts, public.metric_samples;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
