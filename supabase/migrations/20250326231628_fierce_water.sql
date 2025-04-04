/*
  # Add job pools and status management

  1. New Tables
    - `job_pools`
      - Groups similar jobs based on target audience
      - Title and description for the pool
      - Status tracking for pool activity
    
  2. Changes
    - Add status fields to jobs table
    - Add pool relationship to jobs
    - Add application deadline
    - Add publication status

  3. Security
    - Enable RLS on new tables
    - Add policies for job pool access
*/

-- Create job pools table
CREATE TABLE IF NOT EXISTS job_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft' 
  CHECK (status IN ('draft', 'published', 'pending', 'open', 'closed', 'shortlisting', 'hired'));

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS publication_status text NOT NULL DEFAULT 'draft'
  CHECK (publication_status IN ('draft', 'published'));

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS applications_close_at date;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pool_id uuid REFERENCES job_pools(id);

-- Enable RLS
ALTER TABLE job_pools ENABLE ROW LEVEL SECURITY;

-- Job pools policies
CREATE POLICY "Anyone can read job pools"
  ON job_pools
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employers can create job pools"
  ON job_pools
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'employer'
  ));