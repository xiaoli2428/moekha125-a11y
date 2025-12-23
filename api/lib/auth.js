import supabase from './supabase.js';
import { verifyToken } from './jwt.js';

// CORS Headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Handle OPTIONS request (CORS preflight)
export const handleCors = (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).setHeader('Content-Type', 'text/plain');
        Object.entries(corsHeaders).forEach(([key, value]) => {
            res.setHeader(key, value);
        });
        return res.end();
    }
};

// Set CORS headers on response
export const setCorsHeaders = (res) => {
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
};

// Authenticate middleware (returns user or null)
export const authenticate = async (req) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (!decoded) {
            return null;
        }

        // Fetch user from database
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, username, role, status')
            .eq('id', decoded.userId)
            .single();

        if (error || !user) {
            return null;
        }

        if (user.status !== 'active') {
            return null;
        }

        return user;
    } catch (error) {
        return null;
    }
};

// Check if user is admin
export const isAdmin = (user) => {
    return user && (user.role === 'admin' || user.role === 'master');
};

// Check if user is master
export const isMaster = (user) => {
    return user && user.role === 'master';
};

export default {
    handleCors,
    setCorsHeaders,
    authenticate,
    isAdmin,
    isMaster
};
