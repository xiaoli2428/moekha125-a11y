import jwt from 'jsonwebtoken';

let jwtSecret = null;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function getJwtSecret() {
    if (!jwtSecret) {
        jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('Missing JWT_SECRET environment variable');
        }
    }
    return jwtSecret;
}

export function generateToken(payload) {
    const secret = getJwtSecret();
    return jwt.sign(payload, secret, {
        expiresIn: JWT_EXPIRES_IN
    });
}

export function verifyToken(token) {
    try {
        const secret = getJwtSecret();
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
}

export default { generateToken, verifyToken };
