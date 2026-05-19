import { createClient } from '@supabase/supabase-js';

const projectId = "jraaydllvlzaxxcirvcz";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYWF5ZGxsdmx6YXh4Y2lydmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjY0NzYsImV4cCI6MjA5NDYwMjQ3Nn0.sqcnWQfdkpFa9XiJyzC8OxG8-f2i8CrXggT8XdRXCUw";

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

console.log('Testing Supabase connection...');
console.log('URL:', `https://${projectId}.supabase.co`);

// Test estudiantes table
supabase.from('estudiantes').select('count').then(({ data, error }) => {
  if (error) {
    console.error('❌ Error estudiantes:', error.message);
  } else {
    console.log('✅ estudiantes table accessible');
  }
});

// Test paradas table
supabase.from('paradas').select('count').then(({ data, error }) => {
  if (error) {
    console.error('❌ Error paradas:', error.message);
  } else {
    console.log('✅ paradas table accessible');
  }
});
