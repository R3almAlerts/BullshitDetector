// scripts/seed-admin.js
// Run: node scripts/seed-admin.js (after npm i @supabase/supabase-js)
// Requires .env.local: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_KEY

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env: Add VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY to .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Idempotent: Delete if exists, then create
async function seedAdmin() {
  try {
    // Step 1: Delete existing (idempotent)
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', 'admin@r3alm.com')
      .single();

    if (existing) {
      console.log('Deleting existing admin...');
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existing.id);
      if (deleteError) throw deleteError;
      // Also delete profile
      await supabaseAdmin.from('profiles').delete().eq('email', 'admin@r3alm.com');
    }

    // Step 2: Create user via Admin API (auto-hashes password correctly)
    console.log('Creating demo admin...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@r3alm.com',
      password: 'admin123',
      email_confirm: true,  // Auto-confirm for dev
      user_metadata: { role: 'admin' }  // For AuthContext extraction
    });

    if (createError) throw createError;

    // Step 3: Upsert profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: newUser.user.id,
        email: 'admin@r3alm.com',
        role: 'admin',
        mode: 'professional',
        created_at: new Date().toISOString()
      });

    if (profileError) throw profileError;

    console.log(`✅ Demo admin seeded: ${newUser.user.id} (role: admin). Test login now!`);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seedAdmin();