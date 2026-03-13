import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://envnhuxrfulahgepswvp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVudm5odXhyZnVsYWhnZXBzd3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDE0MzgsImV4cCI6MjA4NTAxNzQzOH0.xe45YtM9n5ydUhgCb7zWStTmbLe7g_EmnAdg8SjjhDM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);