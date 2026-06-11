// Express framework import kar rahe hain server and routes handle karne ke liye
import express from 'express';

// ioredis client import kar rahe hain Redis connection aur operations ke liye
import Redis from 'ioredis';

// Express application ka instance create kiya
const app = express();

// Middleware: Express ko incoming requests ka JSON body parse karne ke liye configure kiya
app.use(express.json());

// Redis Client initialization. Agar environment variable mein custom URL ho toh use use karega, warna defaults to localhost:6379
const redis = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379'
);

// Redis connection error event listener to catch and print ECONNRESET errors gracefully
redis.on('error', (err) => {
  console.warn('Redis connection issue:', err.message);
});

// Redis Key Constant: Taaki har jagah consistency bani rahe aur typos se bacha jaa sake
const BANNER_KEY = 'app:banner';

// POST Endpoint (/banner) - Redis mein naya message store (set) karne ke liye
app.post('/banner', async (req, res) => {
  // Request body se message fetch karein, agar nahi hai toh default text use karein
  const message = req.body.message || 'Welcome to our website';
  
  // redis.set() ke through BANNER_KEY mein value message ko key-value store mein write kiya
  await redis.set(BANNER_KEY, message);
  
  // Status response send kiya
  res.json({ success: true });
});

// GET Endpoint (/banner) - Redis se currently stored banner message ko fetch karne ke liye
app.get('/banner', async (req, res) => {
  // redis.get() ke through key ki string value get kari
  const message = await redis.get(BANNER_KEY);
  
  // JSON key representation send kiya client ko
  res.json({ message });
});

// DELETE Endpoint (/banner) - Redis database se banner key delete karne ke liye
app.delete('/banner', async (req, res) => {
  // redis.del() key-value store se specified key ko delete (remove) karta hai
  await redis.del(BANNER_KEY);
  res.json({ success: true });
});

// GET Endpoint (/banner/exists) - Check karne ke liye ki Redis DB mein key present hai ya nahi
app.get('/banner/exists', async (req, res) => {
  // redis.exists() integer (1 or 0) return karta hai. Usko Boolean me change kiya (true/false)
  const exists = Boolean(await redis.exists(BANNER_KEY));
  
  // Response mein key presence status return kiya
  res.json({ exists: Boolean(exists) });
});

// Express Server ko Port 3000 par launch kiya
app.listen(3000, () => console.log('Server running on port 3000'));