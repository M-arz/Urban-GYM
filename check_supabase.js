const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://azllprfyyzqqbhqpbtsc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bGxwcmZ5eXpxcWJocXBidHNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAzNzkxMSwiZXhwIjoyMDg5NjEzOTExfQ.s_ThQYTRgfNLRmRSt3d-wga_je3uWBvzxnimr7wA49I'
);

async function run() {
  const { data: gymsPublic, error: errPublic } = await supabase.from('gyms').select('*');
  const { data: gymsFac, error: errFac } = await supabase.schema('facilities').from('gyms').select('*');
  
  console.log('Public Schema gyms:', gymsPublic, errPublic?.message);
  console.log('Facilities Schema gyms:', gymsFac, errFac?.message);
}

run();
