/*
  # Add job categories and specializations

  1. New Tables
    - `job_categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `job_specializations`
      - `id` (uuid, primary key)
      - `category_id` (uuid, references job_categories)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add category and specialization references to candidate_profiles

  3. Security
    - Enable RLS on both tables
    - Add policies for admin management
    - Add policies for authenticated users to read
*/

-- Create job categories table
CREATE TABLE IF NOT EXISTS job_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create job specializations table
CREATE TABLE IF NOT EXISTS job_specializations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES job_categories(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(category_id, name)
);

-- Add references to candidate_profiles
ALTER TABLE candidate_profiles 
ADD COLUMN category_id uuid REFERENCES job_categories(id),
ADD COLUMN specialization_id uuid REFERENCES job_specializations(id);

-- Enable RLS
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_specializations ENABLE ROW LEVEL SECURITY;

-- Policies for job categories
CREATE POLICY "Admins can manage job categories"
  ON job_categories
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

CREATE POLICY "Anyone can read job categories"
  ON job_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for job specializations
CREATE POLICY "Admins can manage job specializations"
  ON job_specializations
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

CREATE POLICY "Anyone can read job specializations"
  ON job_specializations
  FOR SELECT
  TO authenticated
  USING (true);