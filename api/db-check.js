// Debug endpoint to check Supabase table structure
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // Try to get column info by selecting from users
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      return res.json({
        error: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      });
    }
    
    // Return column names if we got data
    const columns = data && data.length > 0 ? Object.keys(data[0]) : 'No records, table may be empty';
    
    res.json({
      success: true,
      columns,
      sampleData: data
    });
  } catch (e) {
    res.json({ catchError: e.message });
  }
}
