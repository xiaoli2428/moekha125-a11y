import supabase from '../config/database.js'

// Submit KYC
export const submitKYC = async (req, res) => {
  try {
    const userId = req.user.id
    const { full_name, document_type, document_number, front_image_url, back_image_url } = req.body

    if (!full_name || !document_type || !document_number || !front_image_url || !back_image_url) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    // Check if user already has a pending or approved KYC
    const { data: existingKYC } = await supabase
      .from('kyc_submissions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'approved'])
      .single()

    if (existingKYC) {
      return res.status(400).json({ 
        error: existingKYC.status === 'approved' 
          ? 'KYC already approved' 
          : 'KYC submission already pending review' 
      })
    }

    // Create KYC submission
    const { data: kyc, error } = await supabase
      .from('kyc_submissions')
      .insert({
        user_id: userId,
        full_name,
        document_type,
        document_number,
        front_image_url,
        back_image_url,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to submit KYC' })
    }

    // Update user's KYC status
    await supabase
      .from('users')
      .update({ kyc_status: 'pending' })
      .eq('id', userId)

    res.json({ message: 'KYC submitted successfully', kyc })
  } catch (error) {
    console.error('Submit KYC error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get user's KYC submissions
export const getUserKYC = async (req, res) => {
  try {
    const userId = req.user.id

    const { data: submissions, error } = await supabase
      .from('kyc_submissions')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch KYC submissions' })
    }

    res.json(submissions)
  } catch (error) {
    console.error('Get user KYC error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get latest KYC status
export const getKYCStatus = async (req, res) => {
  try {
    const userId = req.user.id

    const { data: user } = await supabase
      .from('users')
      .select('kyc_status, credit_score')
      .eq('id', userId)
      .single()

    const { data: latestKYC } = await supabase
      .from('kyc_submissions')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()

    res.json({
      kyc_status: user?.kyc_status || 'not_submitted',
      credit_score: user?.credit_score || 10,
      latest_submission: latestKYC
    })
  } catch (error) {
    console.error('Get KYC status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Admin: Get all KYC submissions
export const getAllKYCSubmissions = async (req, res) => {
  try {
    const { status = 'all', limit = 50, offset = 0 } = req.query

    let query = supabase
      .from('kyc_submissions')
      .select(`
        *,
        users!kyc_submissions_user_id_fkey(email, username)
      `, { count: 'exact' })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: submissions, error, count } = await query
      .order('submitted_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch KYC submissions' })
    }

    res.json({
      submissions,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Get all KYC submissions error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Admin: Review KYC submission
export const reviewKYC = async (req, res) => {
  try {
    const { id } = req.params
    const { status, admin_notes } = req.body
    const adminId = req.user.id

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' })
    }

    // Get the submission
    const { data: submission } = await supabase
      .from('kyc_submissions')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!submission) {
      return res.status(404).json({ error: 'KYC submission not found' })
    }

    // Update submission
    const { data: kyc, error } = await supabase
      .from('kyc_submissions')
      .update({
        status,
        admin_notes: admin_notes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to review KYC' })
    }

    // Update user's KYC status
    await supabase
      .from('users')
      .update({ kyc_status: status })
      .eq('id', submission.user_id)

    res.json({ message: 'KYC reviewed successfully', kyc })
  } catch (error) {
    console.error('Review KYC error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default {
  submitKYC,
  getUserKYC,
  getKYCStatus,
  getAllKYCSubmissions,
  reviewKYC
}
