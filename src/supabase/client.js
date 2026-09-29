import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean up any extra quotes or trailing slashes accidentally pasted
export const supabaseUrl = rawUrl.trim().replace(/^["']|["']$/g, '').replace(/\/$/, '');
export const supabaseAnonKey = rawKey.trim().replace(/^["']|["']$/g, '');

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseUrl.includes('your_supabase_url') &&
  supabaseAnonKey.length > 20
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (isSupabaseConfigured) {
  console.log('⚡ Supabase initialized successfully with URL:', supabaseUrl);
} else {
  console.info('💡 Supabase credentials not detected in .env. Running in Demo Local Mode.');
}

export default supabase;
