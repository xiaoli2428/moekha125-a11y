import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function verifyAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', decoded.userId)
      .single();
    
    if (!user || (user.role !== 'admin' && user.role !== 'master')) {
      return null;
    }
    
    return user;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const admin = await verifyAdmin(req);
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized - Admin access required' });
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
