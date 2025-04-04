/*
  # Create users and jobs tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `role` (text)
      - `created_at` (timestamp)
    - `jobs`
      - `id` (uuid, primary key)
      - `employer_id` (uuid, references users)
      - `title` (text)
      - `description` (text)
      - `required_candidates` (integer)
      - `level` (text)
      - `start_date` (date)
      - `created_at` (timestamp)
    - `applications`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs)
      - `candidate_id` (uuid, references users)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('employer', 'candidate')),
  created_at timestamptz DEFAULT now()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES users(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  required_candidates integer NOT NULL DEFAULT 1,
  level text NOT NULL CHECK (level IN ('junior', 'mid', 'senior', 'expert')),
  start_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) NOT NULL,
  candidate_id uuid REFERENCES users(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Jobs policies
CREATE POLICY "Employers can create jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Employers can read own jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (employer_id = auth.uid());

CREATE POLICY "Candidates can read all jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'candidate'
  ));

-- Applications policies
CREATE POLICY "Candidates can apply to jobs"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Users can read own applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    candidate_id = auth.uid()
    OR
    job_id IN (
      SELECT id FROM jobs WHERE employer_id = auth.uid()
    )
  );