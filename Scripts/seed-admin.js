// scripts/seed-admin.js
// Run: npm run seed:admin (after setup .env.local with VITE_SUPABASE_SERVICE_KEY)
// Idempotent: Deletes existing, creates new with native hashing; uses 'user_profiles' table (matches ProfilePage/log).

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing env: VITE_SUPABASE_URL in .env.local (should be https://hinzcotdeuszvvyidbqe.supabase.co)');
  process.exit(1);
}
if (!supabaseServiceKey) {
  console.error('❌ Missing env: VITE_SUPABASE_SERVICE_KEY in .env.local (service_role key from Dashboard > Settings > API)');
  process.exit(1);
}
if (supabaseServiceKey.length < 300 || !supabaseServiceKey.startsWith('eyJ')) {
  console.error('❌ Invalid VITE_SUPABASE_SERVICE_KEY: Too short (<300 chars) or wrong format (should start with "eyJ"). Copy exact service_role key from Dashboard.');
  process.exit(1);
}
console.log('✅ Env loaded: URL OK, Service Key OK (preview: ' + supabaseServiceKey.substring(0, 20) + '..., length: ' + supabaseServiceKey.length + ')');

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seedAdmin() {
  try {
    console.log('🔍 Checking for existing admin...');
    const { data: { user } } = await supabaseAdmin.auth.admin.listUsers();
    const existing = user.find((u: any) => u.email === 'admin@r3alm.com');
    if (existing) {
      console.log('🗑️ Deleting existing admin...');
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existing.id);
      if (deleteError) throw new Error(`Delete failed: ${deleteError.message}`);
      // Clean profile (use 'user_profiles' table from log/ProfilePage)
      const { error: profileDelete } = await supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('email', 'admin@r3alm.com');
      if (profileDelete) console.warn(`Profile delete warning: ${profileDelete.message}`);
    }

    console.log('👤 Creating demo admin with native hashing...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@r3alm.com',
      password: 'admin123',
      email_confirm: true,  // Auto-confirm for dev (toggle off in prod)
      user_metadata: { role: 'admin' }  // Extracted in AuthContext
    });

    if (createError) throw new Error(`Create failed: ${createError.message}`);

    console.log('📝 Upserting profile in user_profiles...');
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')  // Fixed: Use 'user_profiles' (matches ProfilePage/log)
      .upsert({
        user_id: newUser.user.id,
        email: 'admin@r3alm.com',
        mode: 'professional',  // From ProfilePage schema
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id' });  // Explicit onConflict for unique user_id (avoids 409)

    if (profileError) throw new Error(`Profile upsert failed: ${profileError.message}`);

    console.log(`✅ Demo admin seeded: ${newUser.user.id} (role: admin, confirmed). Test login!`);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seedAdmin();