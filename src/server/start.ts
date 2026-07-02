import { app, httpServer } from './index.js';
import { connectDB } from '../lib/db.js';

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`\n⚔️ World of Nova - Nightfall v1.0 (Web Server)`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log('');
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
