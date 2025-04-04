/*
  # Update schema for complete user profiles

  1. New Tables
    - `companies`
      - Company details including name, size, industry, etc.
    - `work_experience`
      - Work history for candidates
    - `education`
      - Educational background for candidates
    - `candidate_profiles`
      - Extended profile information for job seekers

  2. Changes
    - Add profile fields to users table
    - Add company relationship to employers

  3. Security
    - Enable RLS on all new tables
    - Add appropriate access policies
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  industry text NOT NULL,
  size text NOT NULL,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create work_experience table
CREATE TABLE IF NOT EXISTS work_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES users(id) NOT NULL,
  role text NOT NULL,
  company text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  description text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create education table
CREATE TABLE IF NOT EXISTS education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES users(id) NOT NULL,
  level text NOT NULL,
  school_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  gpa text,
  achievements text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create candidate_profiles table
CREATE TABLE IF NOT EXISTS candidate_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  age_group text NOT NULL,
  career_summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- Add company_id to users for employers
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES companies(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Employers can manage their company"
  ON companies
  FOR ALL
  TO authenticated
  USING (id IN (
    SELECT company_id 
    FROM users 
    WHERE users.id = auth.uid()
  ))
  WITH CHECK (id IN (
    SELECT company_id 
    FROM users 
    WHERE users.id = auth.uid()
  ));

-- Work experience policies
CREATE POLICY "Candidates can manage their work experience"
  ON work_experience
  FOR ALL
  TO authenticated
  USING (candidate_id = auth.uid())
  WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Employers can view candidate work experience"
  ON work_experience
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE j.employer_id = auth.uid()
    AND a.candidate_id = work_experience.candidate_id
  ));

-- Education policies
CREATE POLICY "Candidates can manage their education"
  ON education
  FOR ALL
  TO authenticated
  USING (candidate_id = auth.uid())
  WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Employers can view candidate education"
  ON education
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE j.employer_id = auth.uid()
    AND a.candidate_id = education.candidate_id
  ));

-- Candidate profiles policies
CREATE POLICY "Candidates can manage their profile"
  ON candidate_profiles
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Employers can view candidate profiles"
  ON candidate_profiles
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE j.employer_id = auth.uid()
    AND a.candidate_id = candidate_profiles.user_id
  ));