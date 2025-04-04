/*
  # Add test questions management

  1. New Tables
    - `test_questions`
      - `id` (uuid, primary key)
      - `specialization_id` (uuid, references job_specializations)
      - `chapter` (text)
      - `seniority` (text)
      - `question` (text)
      - `is_multiple_choice` (boolean)
      - `options` (text array)
      - `correct_answer` (text)
      - `marks` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for admin management
    - Add policies for candidates to read questions during tests
*/

-- Create test questions table
CREATE TABLE IF NOT EXISTS test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialization_id uuid REFERENCES job_specializations(id) ON DELETE CASCADE NOT NULL,
  chapter text NOT NULL,
  seniority text NOT NULL CHECK (seniority IN ('junior', 'mid', 'senior', 'expert')),
  question text NOT NULL,
  is_multiple_choice boolean NOT NULL DEFAULT false,
  options text[] DEFAULT '{}',
  correct_answer text NOT NULL,
  marks integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;

-- Policies for test questions
CREATE POLICY "Admins can manage test questions"
  ON test_questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Candidates can read test questions during tests"
  ON test_questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'candidate'
    )
  );