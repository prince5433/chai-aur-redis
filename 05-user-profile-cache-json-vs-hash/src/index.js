// Express framework import kar rahe hain API routing manage karne ke liye
import express from 'express';

// ioredis client import kiya Redis operations and database connection handle karne ke liye
import Redis from 'ioredis';

// Express application instanciate kiya
const app = express();

// Middleware configured to parse JSON request bodies
app.use(express.json());

// Redis Server connection. Localhost ki jagah 127.0.0.1 specify kiya taaki Windows par IPv6 socket reset errors na aayein
const redis = new Redis(
  process.env.REDIS_URL || 'redis://127.0.0.1:6379'
);

// Redis connection error event listener to catch and print ECONNRESET errors gracefully
redis.on('error', (err) => {
  console.warn('Redis connection issue:', err.message);
});

// ==========================================
// METHOD 1: SET Command (JSON String Approach)
// ==========================================

// POST Endpoint - User profile data ko ek single stringify JSON String ke roop me set karne ke liye
app.post('/user/:id/json', async (req, res) => {
  // Key format: e.g., "user:123:json"
  const key = `user:${req.params.id}:json`;
  
  // JSON.stringify() ka use karke pure body object ko flat string me convert karke SET kiya
  await redis.set(key, JSON.stringify(req.body));
  
  res.json({ savedAs: "json" });
});

// GET Endpoint - Stringified JSON user data fetch karke parse karne ke liye
app.get('/user/:id/json', async (req, res) => {
  const key = `user:${req.params.id}:json`;
  
  // redis.get() string return karta hai
  const raw = await redis.get(key);
  
  // Response check: string exist karti hai toh use JSON object me parse kiya, nahi toh null return kiya
  res.json({ user: raw ? JSON.parse(raw) : null });
});

// ==========================================
// METHOD 2: HSET Command (Hash/Object Approach)
// ==========================================

// POST Endpoint - Pure object fields ko direct Redis Hash me store (HSET) karne ke liye
app.post('/user/:id/hash', async (req, res) => {
  // Key format: e.g., "user:123:hash"
  const key = `user:${req.params.id}:hash`;
  
  // redis.hset() directly pure object ko flat fields-values ke form me structure karke store karta hai
  await redis.hset(key, req.body);
  
  res.json({ savedAs: "hash" });
});

// GET Endpoint - Redis Hash se pure fields (hgetall) directly bina custom parse kiye fetch karne ke liye
app.get('/user/:id/hash', async (req, res) => {
  const key = `user:${req.params.id}:hash`;
  
  // hgetall() direct object format return karta hai
  const user = await redis.hgetall(key);
  
  // Response user status return kiya. Agar key empty hai toh empty object ya null dikhega
  res.json({ user: Object.keys(user).length > 0 ? user : null });
});

// Server starts listening on http://localhost:3000
app.listen(3000, () => {
  console.log("server is running on port 3000");  
});