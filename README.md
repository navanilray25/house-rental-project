# 🏠 Student House Rental & Utility Management System

A full-stack, mobile-responsive web portal tailored for student rental accommodations, PGs, mess, and hostels. It streamlines monthly rent collection, automatic electricity meter unit calculations, payment proof verification, and downloadable official digital rent receipts.

Built with **React 18 + Vite**, **Tailwind CSS**, and **Supabase**.

---

## 🚀 Quick Start (Running Locally)

### 1. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## ⚡ Instant Demo Accounts (Test Right Away!)

The application includes an **instant offline/demo store with local storage persistence**. You can test the full student and landlord workflows right away before connecting Supabase!

- **Student Login**: `aarav@student.com` | Password: `student123` (Room #101)
- **Landlord / Admin Login**: `admin@rental.com` | Password: `admin123`
- Or click **"Switch to Landlord View / Student View"** in the top navigation bar to toggle between perspectives with 1 click!

---

## ⚡ Connecting Supabase (Cloud Backend in 3 Minutes)

Supabase is much simpler than Firebase — you only need **2 keys**:

### Step 1: Create a Supabase Project
1. Go to **[https://supabase.com](https://supabase.com)** and sign in.
2. Click **New Project**, choose an organization and project name (e.g. `rental-portal`), set a database password, and create the project.

### Step 2: Get Your 2 Keys
1. In your project dashboard, click the **⚙️ Project Settings** (gear icon at the bottom of the left sidebar).
2. Click on **API** in the settings menu.
3. You will see:
   - **Project URL** (e.g., `https://xyzabcdefg.supabase.co`)
   - **Project API Keys** ➔ copy the **`anon` `public`** key (starts with `eyJ...`)

### Step 3: Paste into [`.env`](file:///f:/VIBE%20Project/.env)
Open your [`.env`](file:///f:/VIBE%20Project/.env) file in `f:\VIBE Project\.env` and paste:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_ADMIN_SECRET_KEY=admin123
```

### Step 4: Run the SQL Schema (Creates all tables in 10 seconds)
1. In the Supabase left sidebar, click the **SQL Editor** icon (`>_`).
2. Open the file [`supabase_schema.sql`](file:///f:/VIBE%20Project/supabase_schema.sql) in your project root.
3. Copy all of its contents, paste it into the Supabase SQL Editor, and click **RUN**!
4. It will automatically create:
   - `profiles` (Student & Landlord details)
   - `payments` (Monthly rent & electricity units submissions)
   - `house_settings` (Electricity unit rate and UPI ID)
   - `notices` (Announcements)
   - `complaints` (Maintenance tickets)
   - `receipts` storage bucket (for payment proof screenshots)

Restart your dev server (`npm run dev`), and your portal is now live with Supabase!
