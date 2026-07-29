const http = require('http');
const req = http.get('http://localhost:8081/', (res) => {
  console.log('Status:', res.statusCode);
  let d = '';
  res.on('data', (c) => d += c);
  res.on('end', () => {
    if (d.includes('error') || d.includes('Error')) {
      console.log('POSSIBLE ERROR in bundle');
      console.log(d.substring(0, 500));
    } else {
      console.log('Bundle OK, length:', d.length);
    }
  });
});
req.on('error', (e) => console.log('Connection error:', e.message));
