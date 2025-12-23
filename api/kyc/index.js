import { handleCors, setCorsHeaders, authenticate } from '../../lib/auth.js';
import supabase from '../../lib/supabase.js';

export default async function handler(req, res) {
    handleCors(req, res);
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const user = await authenticate(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // POST /api/kyc/submit
        if (req.method === 'POST' && req.url === '/api/kyc/submit') {
            return submitKYC(req, res, user);
        }

        // GET /api/kyc/status
        if (req.method === 'GET' && req.url === '/api/kyc/status') {
            return getKYCStatus(req, res, user);
        }

        return res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('KYC error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function submitKYC(req, res, user) {
    try {
        const { full_name, document_type, document_number, front_image_url, back_image_url } = req.body;

        if (!full_name || !document_type || !document_number || !front_image_url || !back_image_url) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already has a pending or approved KYC
        const { data: existingKYC } = await supabase
            .from('kyc_submissions')
            .select('*')
            .eq('user_id', user.id)
            .in('status', ['pending', 'approved'])
            .single();

        if (existingKYC) {
            return res.status(400).json({
                error: existingKYC.status === 'approved'
                    ? 'KYC already approved'
                    : 'KYC submission already pending review'
            });
        }

        // Create KYC submission
        const { data: kyc, error } = await supabase
            .from('kyc_submissions')
            .insert({
                user_id: user.id,
                full_name,
                document_type,
                document_number,
                front_image_url,
                back_image_url,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to submit KYC' });
        }

        res.status(201).json({ message: 'KYC submitted', kyc });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getKYCStatus(req, res, user) {
    try {
        const { data: kyc, error } = await supabase
            .from('kyc_submissions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            return res.json({ status: 'not_submitted' });
        }

        res.json({ status: kyc.status, kyc });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
