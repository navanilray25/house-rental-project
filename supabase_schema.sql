-- =======================================================
-- Supabase Schema for Student Rental & Utility Management
-- Copy and paste this script into Supabase SQL Editor and click RUN!
-- =======================================================

-- 1. Profiles Table (Student & Admin info)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT DEFAULT 'Student',
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  room_number TEXT DEFAULT '101',
  base_rent NUMERIC DEFAULT 4500,
  role TEXT DEFAULT 'student',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. House Configuration Table
CREATE TABLE IF NOT EXISTS public.house_settings (
  id TEXT PRIMARY KEY DEFAULT 'default_config',
  house_name TEXT DEFAULT 'Greenwood Student Residency',
  electricity_rate NUMERIC DEFAULT 10,
  currency TEXT DEFAULT '₹',
  contact_phone TEXT DEFAULT '+91 98765 43210',
  upi_id TEXT DEFAULT 'landlord@upi',
  address TEXT DEFAULT '14/B University Road',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default house settings if missing
INSERT INTO public.house_settings (id, house_name, electricity_rate, currency, contact_phone, upi_id, address)
VALUES ('default_config', 'Greenwood Student Residency', 10, '₹', '+91 98765 43210', 'landlord@upi', '14/B University Road')
ON CONFLICT (id) DO NOTHING;

-- 3. Monthly Payments & Electricity Records Table
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  rent_amount NUMERIC DEFAULT 0,
  electricity_units NUMERIC DEFAULT 0,
  unit_rate NUMERIC DEFAULT 10,
  electricity_amount NUMERIC DEFAULT 0,
  other_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  payment_mode TEXT DEFAULT 'upi',
  transaction_id TEXT,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending',
  admin_remarks TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- 4. House Notices Table
CREATE TABLE IF NOT EXISTS public.notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  author TEXT DEFAULT 'Landlord',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Student Complaints & Maintenance Desk
CREATE TABLE IF NOT EXISTS public.complaints (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  category TEXT DEFAULT 'plumbing',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  admin_reply TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Full Public Access Policies (Allows React App to Read & Write easily)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Profiles Access" ON public.profiles;
CREATE POLICY "Public Profiles Access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.house_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public House Settings Access" ON public.house_settings;
CREATE POLICY "Public House Settings Access" ON public.house_settings FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Payments Access" ON public.payments;
CREATE POLICY "Public Payments Access" ON public.payments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Notices Access" ON public.notices;
CREATE POLICY "Public Notices Access" ON public.notices FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Complaints Access" ON public.complaints;
CREATE POLICY "Public Complaints Access" ON public.complaints FOR ALL USING (true) WITH CHECK (true);
