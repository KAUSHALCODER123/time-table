import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://udcpqwhnrvnmojgsctrp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkY3Bxd2hucnZubW9qZ3NjdHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTQ3MzksImV4cCI6MjA4OTU5MDczOX0.rZrMWdzlSegil1qWG-jsiU8vEh6yeiC5wBNf9KBa5MY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase as s };
