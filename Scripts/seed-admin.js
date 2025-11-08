// scripts/seed-admin.js
// Run: npm run seed:admin (after setup .env.local with VITE_SUPABASE_SERVICE_KEY)
// Idempotent: Deletes existing, creates new with native hashing.

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing env: VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seedAdmin() {
  try {
    console.log('🔍 Checking for existing admin...');
    const { data: existing } = await supabaseAdmin
      .from('users')  // Note: Admin client queries auth.users as 'users'
      .select('id')
      .eq('email', 'admin@r3alm.com')
      .single();

    if (existing) {
      console.log('🗑️ Deleting existing admin...');
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existing.id);
      if (deleteError) throw new Error(`Delete failed: ${deleteError.message}`);
      // Clean profile
      const { error: profileDelete } = await supabaseAdmin
        .from('profiles')
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

    console.log('📝 Upserting profile...');
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: newUser.user.id,
        email: 'admin@r3alm.com',
        role: 'admin',
        mode: 'professional',
        created_at: new Date().toISOString()
      });

    if (profileError) throw new Error(`Profile upsert failed: ${profileError.message}`);

    console.log(`✅ Demo admin seeded: ${newUser.user.id} (role: admin, confirmed). Test login!`);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seedAdmin();