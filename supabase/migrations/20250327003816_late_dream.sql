/*
  # Add category and specialization fields to jobs table

  1. Changes
    - Add category_id and specialization_id fields to jobs table
    - Add foreign key constraints
*/

ALTER TABLE jobs
  ADD COLUMN category_id uuid REFERENCES job_categories(id),
  ADD COLUMN specialization_id uuid REFERENCES job_specializations(id);