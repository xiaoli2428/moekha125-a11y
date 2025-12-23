import bcrypt from 'bcrypt';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const hash = await bcrypt.hash('test', 10);
        return res.status(200).json({ hash, message: 'bcrypt loaded successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
