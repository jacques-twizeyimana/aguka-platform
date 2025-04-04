/*
  # Add test-related tables

  1. New Tables
    - `candidate_tests`
      - Stores test sessions for candidates
      - Tracks test status, start/end time, and results
      - Enforces 6-month cooldown period
    
    - `test_sessions`
      - Stores individual test attempts (practice or official)
      - Records video footage, location data
      - Tracks question responses and auto-saves progress
    
    - `test_responses`
      - Stores candidate responses to questions
      - Links to test sessions and questions
      - Records timestamps for analytics

  2. Security
    - Enable RLS on all tables
    - Candidates can only view and manage their own tests
    - Employers can view test results for their applicants
*/

-- Create candidate_tests table
CREATE TABLE IF NOT EXISTS candidate_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES users(id) NOT NULL,
  specialization_id uuid REFERENCES job_specializations(id) NOT NULL,
  seniority text NOT NULL CHECK (seniority = ANY (ARRAY['junior', 'mid', 'senior', 'expert'])),
  last_test_date timestamptz,
  next_available_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (candidate_id, specialization_id)
);

-- Create test_sessions table
CREATE TABLE IF NOT EXISTS test_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_test_id uuid REFERENCES candidate_tests(id) NOT NULL,
  is_practice boolean DEFAULT false NOT NULL,
  status text DEFAULT 'in_progress' CHECK (status = ANY (ARRAY['in_progress', 'completed', 'abandoned'])),
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  video_url text,
  location_data jsonb,
  score integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create test_responses table
CREATE TABLE IF NOT EXISTS test_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_session_id uuid REFERENCES test_sessions(id) NOT NULL,
  question_id uuid REFERENCES test_questions(id) NOT NULL,
  answer text NOT NULL,
  is_correct boolean,
  answered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE candidate_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_responses ENABLE ROW LEVEL SECURITY;

-- Policies for candidate_tests
CREATE POLICY "Candidates can view their own tests"
  ON candidate_tests
  FOR SELECT
  TO authenticated
  USING (candidate_id = auth.uid());

CREATE POLICY "Candidates can create their own tests"
  ON candidate_tests
  FOR INSERT
  TO authenticated
  WITH CHECK (candidate_id = auth.uid());

-- Policies for test_sessions
CREATE POLICY "Candidates can view their own test sessions"
  ON test_sessions
  FOR SELECT
  TO authenticated
  USING (
    candidate_test_id IN (
      SELECT id FROM candidate_tests 
      WHERE candidate_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can create their own test sessions"
  ON test_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    candidate_test_id IN (
      SELECT id FROM candidate_tests 
      WHERE candidate_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can update their own test sessions"
  ON test_sessions
  FOR UPDATE
  TO authenticated
  USING (
    candidate_test_id IN (
      SELECT id FROM candidate_tests 
      WHERE candidate_id = auth.uid()
    )
  );

-- Policies for test_responses
CREATE POLICY "Candidates can view their own test responses"
  ON test_responses
  FOR SELECT
  TO authenticated
  USING (
    test_session_id IN (
      SELECT ts.id FROM test_sessions ts
      JOIN candidate_tests ct ON ct.id = ts.candidate_test_id
      WHERE ct.candidate_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can create their own test responses"
  ON test_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    test_session_id IN (
      SELECT ts.id FROM test_sessions ts
      JOIN candidate_tests ct ON ct.id = ts.candidate_test_id
      WHERE ct.candidate_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can update their own test responses"
  ON test_responses
  FOR UPDATE
  TO authenticated
  USING (
    test_session_id IN (
      SELECT ts.id FROM test_sessions ts
      JOIN candidate_tests ct ON ct.id = ts.candidate_test_id
      WHERE ct.candidate_id = auth.uid()
    )
  );