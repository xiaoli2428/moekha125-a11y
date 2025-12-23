// Simple login without bcrypt to test if the issue is with native modules
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Hardcoded test user (no database query, no bcrypt)
        if (email === 'test@test.com' && password === 'password') {
            return res.status(200).json({
                message: 'Login successful',
                token: 'test_token_12345',
                user: { id: '1', email: 'test@test.com', username: 'testuser', role: 'user' }
            });
        }

        return res.status(401).json({ error: 'Invalid credentials' });
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}
