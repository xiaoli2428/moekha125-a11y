import { handleCors, setCorsHeaders, authenticate } from '../../lib/auth.js';
import supabase from '../../lib/supabase.js';

// Default deposit addresses if none configured by admin
const DEFAULT_ADDRESSES = [
  { coin_symbol: 'USDT', network: 'TRC20', address: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6', is_active: true },
  { coin_symbol: 'USDT', network: 'ERC20', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b2E0', is_active: true },
  { coin_symbol: 'USDT', network: 'BEP20', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b2E0', is_active: true },
  { coin_symbol: 'BTC', network: 'Bitcoin', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', is_active: true },
  { coin_symbol: 'ETH', network: 'ERC20', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b2E0', is_active: true },
];

export default async function handler(req, res) {
  handleCors(req, res);
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get active deposit addresses from database
    const { data: addresses, error } = await supabase
      .from('deposit_addresses')
      .select('coin_symbol, network, address')
      .eq('is_active', true)
      .order('coin_symbol', { ascending: true });

    // If table doesn't exist or no addresses configured, return defaults
    if (error || !addresses || addresses.length === 0) {
      return res.status(200).json({
        addresses: DEFAULT_ADDRESSES.map(a => ({
          coin_symbol: a.coin_symbol,
          network: a.network,
          address: a.address
        }))
      });
    }

    return res.status(200).json({ addresses });
  } catch (error) {
    console.error('Get deposit addresses error:', error);
    // Return defaults on error
    return res.status(200).json({
      addresses: DEFAULT_ADDRESSES.map(a => ({
        coin_symbol: a.coin_symbol,
        network: a.network,
        address: a.address
      }))
    });
  }
}
