/*
  # Update test schema for grading and review

  1. Changes
    - Add status and review fields to test_sessions
    - Add grading fields to test_responses
    - Add admin review policies
    - Add email template for congratulations

  2. Security
    - Allow admins to review and grade tests
    - Allow admins to update test status
*/

-- Update test_sessions table
ALTER TABLE test_sessions
  ADD COLUMN review_status text DEFAULT 'pending' CHECK (review_status = ANY (ARRAY['pending', 'passed', 'failed', 'disqualified'])),
  ADD COLUMN disqualification_reason text,
  ADD COLUMN reviewed_by uuid REFERENCES users(id),
  ADD COLUMN reviewed_at timestamptz;

-- Update test_responses table
ALTER TABLE test_responses
  ADD COLUMN ai_score integer,
  ADD COLUMN admin_score integer,
  ADD COLUMN admin_notes text;

-- Add admin policies for test review
CREATE POLICY "Admins can view all test sessions"
  ON test_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update test sessions"
  ON test_sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all test responses"
  ON test_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update test responses"
  ON test_responses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );