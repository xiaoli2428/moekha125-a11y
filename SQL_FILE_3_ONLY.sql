-- KYC submissions
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('ID', 'Passport', 'Driver License')),
  document_number VARCHAR(100) NOT NULL,
  front_image_url TEXT NOT NULL,
  back_image_url TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON kyc_submissions(status);

-- Add KYC status to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(50) DEFAULT 'not_submitted' CHECK (kyc_status IN ('not_submitted', 'pending', 'approved', 'rejected'));
