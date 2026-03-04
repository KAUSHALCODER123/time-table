import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rhpxklziuxjxqdgypqer.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHhrbHppdXhqeHFkZ3lwcWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTU0ODYsImV4cCI6MjA4ODEzMTQ4Nn0.4v3a22DUSZG5_X3FyGmU0ZvDFLB_C-LaCJH3q_yc7Bc";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase as s };
