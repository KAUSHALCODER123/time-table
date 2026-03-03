-- Timetable Generator: Database Schema
-- Run this in Supabase SQL Editor

-- Time slot templates (e.g., "Morning Session", "Afternoon Session")
CREATE TABLE IF NOT EXISTS time_slot_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slots JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Classes linked to a template (e.g., "1st Std" → "Afternoon Session")
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template_id UUID REFERENCES time_slot_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Teacher ↔ Template assignments (which templates a teacher can teach in)
CREATE TABLE IF NOT EXISTS teacher_slot_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES time_slot_templates(id) ON DELETE CASCADE,
  UNIQUE(teacher_id, template_id)
);

-- Generated timetable entries
CREATE TABLE IF NOT EXISTS timetables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  slot_index INT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------
-- SYSTEM GRANTS: Allow anon to operate on public schema
-- otherwise policies will be rejected by default!
-- ----------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;

-- Enable RLS
ALTER TABLE time_slot_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_slot_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to all tables
CREATE POLICY "Allow anonymous read" ON time_slot_templates FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON classes FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON teachers FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON teacher_slot_assignments FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON timetables FOR SELECT USING (true);

-- Allow anonymous full access (admin checks happen in API routes)
CREATE POLICY "Allow anonymous insert" ON time_slot_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON time_slot_templates FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON time_slot_templates FOR DELETE USING (true);

CREATE POLICY "Allow anonymous insert" ON classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON classes FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON classes FOR DELETE USING (true);

CREATE POLICY "Allow anonymous insert" ON teachers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON teachers FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON teachers FOR DELETE USING (true);

CREATE POLICY "Allow anonymous insert" ON teacher_slot_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete" ON teacher_slot_assignments FOR DELETE USING (true);

CREATE POLICY "Allow anonymous insert" ON timetables FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON timetables FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON timetables FOR DELETE USING (true);
