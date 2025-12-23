import { handleCors, setCorsHeaders, authenticate, isAdmin } from '../../lib/auth.js';
import supabase from '../../lib/supabase.js';

export default async function handler(req, res) {
  handleCors(req, res);
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = await authenticate(req);
  if (!user || !isAdmin(user)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    // GET - Get all deposit addresses
    if (req.method === 'GET') {
      const { data: addresses, error } = await supabase
        .from('deposit_addresses')
        .select('*')
        .order('coin_symbol', { ascending: true });

      if (error) {
        // Table might not exist, return empty array
        return res.status(200).json({ addresses: [] });
      }

      return res.status(200).json({ addresses: addresses || [] });
    }

    // POST - Create or update deposit address
    if (req.method === 'POST') {
      const { coin_symbol, network, address, is_active = true } = req.body;

      if (!coin_symbol || !network || !address) {
        return res.status(400).json({ error: 'coin_symbol, network, and address are required' });
      }

      // Check if address already exists for this coin/network
      const { data: existing } = await supabase
        .from('deposit_addresses')
        .select('id')
        .eq('coin_symbol', coin_symbol.toUpperCase())
        .eq('network', network)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('deposit_addresses')
          .update({ address, is_active, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json({ message: 'Address updated', address: data });
      }

      // Create new
      const { data, error } = await supabase
        .from('deposit_addresses')
        .insert({
          coin_symbol: coin_symbol.toUpperCase(),
          network,
          address,
          is_active
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ message: 'Address created', address: data });
    }

    // PUT - Update address
    if (req.method === 'PUT') {
      const { id, address, is_active } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Address ID is required' });
      }

      const updates = { updated_at: new Date().toISOString() };
      if (address !== undefined) updates.address = address;
      if (is_active !== undefined) updates.is_active = is_active;

      const { data, error } = await supabase
        .from('deposit_addresses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ message: 'Address updated', address: data });
    }

    // DELETE - Delete address
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Address ID is required' });
      }

      const { error } = await supabase
        .from('deposit_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ message: 'Address deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Deposit addresses error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
