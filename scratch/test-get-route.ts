const clerk = require('@clerk/nextjs/server');

Object.defineProperty(clerk, 'auth', {
  get: () => () => Promise.resolve({ userId: 'user_3BlKuqwlupmRXNJ6BMH8RANPfUN' }),
  configurable: true
});

import { GET } from '../app/api/whatsapp/session/route';

async function run() {
  const req = new Request('http://localhost:3000/api/whatsapp/session?sessionId=cmqzmz0bt00032rqt8qloqi6d');
  const res = await GET(req);
  console.log('Status:', res.status);
  console.log('Body:', await res.json());
}

run();
