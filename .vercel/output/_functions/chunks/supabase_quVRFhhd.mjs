import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oihvjbwzqexnblprdkzi.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9paHZqYnd6cWV4bmJscHJka3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTkyNzksImV4cCI6MjA4ODA5NTI3OX0.5mC4uhT0F6fgA74WA8HVFu_q2ARb5J4vkh-gpFUyRqQ";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase as s };
