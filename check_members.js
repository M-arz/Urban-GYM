const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://azllprfyyzqqbhqpbtsc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bGxwcmZ5eXpxcWJocXBidHNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAzNzkxMSwiZXhwIjoyMDg5NjEzOTExfQ.s_ThQYTRgfNLRmRSt3d-wga_je3uWBvzxnimr7wA49I'
);

async function checkMembers() {
  const { data, error } = await supabase.schema('members').from('members').select('id, email, password, name');
  console.log('Members:', data);
  if (error) console.error('Error:', error);
}

checkMembers();
