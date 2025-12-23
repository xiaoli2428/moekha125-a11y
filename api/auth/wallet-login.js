import { ethers } from 'ethers';

export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { address, message, signature } = req.body || {};

    if (!address || !message || !signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Test: just verify signature
    let recoveredAddress;
    try {
      recoveredAddress = ethers.utils.verifyMessage(message, signature);
    } catch (err) {
      return res.status(400).json({ error: 'Signature verification failed', detail: err.message });
    }

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Address does not match signature' });
    }

    // Return success without database
    return res.status(200).json({
      message: 'Signature verified successfully',
      recoveredAddress,
      address
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
