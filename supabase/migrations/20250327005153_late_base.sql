/*
  # Add talent status to users table

  1. Changes
    - Add is_talent boolean field to users table
    - Add recent_marks integer field to users table
    - Add talent_specialization_id reference to job_specializations
*/

ALTER TABLE users
  ADD COLUMN is_talent boolean DEFAULT false,
  ADD COLUMN recent_marks integer,
  ADD COLUMN talent_specialization_id uuid REFERENCES job_specializations(id);

-- Update function to handle test approval and talent status
CREATE OR REPLACE FUNCTION handle_test_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- If test is marked as passed
  IF NEW.review_status = 'passed' AND OLD.review_status != 'passed' THEN
    -- Update user's talent status and marks
    UPDATE users
    SET 
      is_talent = true,
      recent_marks = NEW.score,
      talent_specialization_id = (
        SELECT ct.specialization_id
        FROM candidate_tests ct
        WHERE ct.id = NEW.candidate_test_id
      )
    WHERE id = (
      SELECT ct.candidate_id
      FROM candidate_tests ct
      WHERE ct.id = NEW.candidate_test_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for test_sessions table
CREATE TRIGGER test_approval_trigger
  AFTER UPDATE ON test_sessions
  FOR EACH ROW
  EXECUTE FUNCTION handle_test_approval();