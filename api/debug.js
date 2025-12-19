// Debug endpoint - temporary
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const supabaseUrl = process.env.SUPABASE_URL || 'NOT SET';
  const hasKey = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (hidden)' : 'NOT SET';
  const hasJwt = process.env.SUPABASE_JWT_SECRET ? 'SET (hidden)' : 'NOT SET';
  
  res.json({
    env: {
      SUPABASE_URL: supabaseUrl.substring(0, 30) + '...',
      SUPABASE_SERVICE_ROLE_KEY: hasKey,
      SUPABASE_JWT_SECRET: hasJwt,
      NODE_ENV: process.env.NODE_ENV || 'unknown'
    }
  });
}
