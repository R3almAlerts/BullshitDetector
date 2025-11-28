// Full file: server/routes/menu.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.get('/api/menu', async (req, res) => {
  try {
    // Fetch dynamic menu from Supabase (e.g., table 'menu_items')
    const { data, error } = await supabase.from('menu_items').select('*');
    if (error) throw error;
    res.json(data || []); // Fallback to defaultItems in frontend
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

module.exports = router;