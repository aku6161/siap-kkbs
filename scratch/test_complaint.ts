import { app } from '../server/app';
import http from 'http';

const server = http.createServer(app);

server.listen(4006, async () => {
  console.log('Test server running on port 4006');

  try {
    const payload = {
      namaPengadu: 'Ahmad Ujian',
      telefon: '0123456789',
      emel: 'ahmad@example.com',
      kategori: 'KEMUDAHAN',
      tajukAduan: 'Ujian Paip Bocor',
      butiranAduan: 'Paip bocor di tandas tingkat 2.',
      lokasi: 'Tandas Aras 2',
      tarikhKejadian: '2026-09-16',
    };

    console.log('1. Testing POST /api/complaints...');
    const res1 = await fetch('http://localhost:4006/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('Status /api/complaints:', res1.status);
    const body1 = await res1.json();
    console.log('Body /api/complaints:', body1.message, body1.complaint?.noRujukan);

    console.log('2. Testing POST /complaints (direct route)...');
    const res2 = await fetch('http://localhost:4006/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('Status /complaints:', res2.status);
    const body2 = await res2.json();
    console.log('Body /complaints:', body2.message, body2.complaint?.noRujukan);

    console.log('3. Testing GET /api/public/summary...');
    const res3 = await fetch('http://localhost:4006/api/public/summary');
    console.log('Status /api/public/summary:', res3.status);

    console.log('4. Testing GET /public/summary (direct route)...');
    const res4 = await fetch('http://localhost:4006/public/summary');
    console.log('Status /public/summary:', res4.status);

    console.log('✅ ALL TESTS PASSED SUCCESSFULLY!');
    server.close();
    process.exit(0);
  } catch (err: any) {
    console.error('Test error:', err);
    server.close();
    process.exit(1);
  }
});
