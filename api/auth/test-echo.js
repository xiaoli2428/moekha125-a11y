export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

    try {
        const data = JSON.parse(req.body || '{}');
        return res.status(200).json({ received: data, timestamp: new Date().toISOString() });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
