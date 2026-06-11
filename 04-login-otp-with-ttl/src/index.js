// Express framework import kar rahe hain API routing manage karne ke liye
import express from 'express';

// ioredis client import kiya Redis operations and database connection handle karne ke liye
import Redis from 'ioredis';

// Express application instanciate kiya
const app = express();

// Middleware configured to parse JSON request bodies
app.use(express.json());

// Redis Server se connect karne ke liye new instance banaya
const redis = new Redis(
  process.env.REDIS_URL || 'redis://127.0.0.1:6379'
);

// Redis connection error event listener to catch and print ECONNRESET errors gracefully
redis.on('error', (err) => {
  console.warn('Redis connection issue:', err.message);
});

// Helper function: Dynamic keys generate karne ke liye taaki uniform pattern rahe, like "otp:9898989898"
function getOtpKey(phone) { 
  return `otp:${phone}`; 
}

// 1. POST Endpoint (/otp) — Ek randomly 4-digit OTP generate karta hai aur Redis mein save karta hai (with TTL)
app.post('/otp', async (req, res) => {
  const { phone } = req.body;
  
  // Math.random() ka use karke 1000 se 9999 ke bich ka 4-digit numeric OTP generate kiya
  const otp = Math.floor(1000 + Math.random() * 9000);

  // Redis mein Key aur Value store karne ke liye redis.set use kiya.
  // 'EX' aur '30' parameters ye ensure karte hain ki ye OTP key 30 seconds ke baad automatic delete (expire) ho jaye.
  await redis.set(
    getOtpKey(phone),   // Key: e.g., "otp:989898"
    otp,                // Value: Jo OTP generate hua hai
    'EX',               // EX stands for Expiry in seconds
    30                  // 30 seconds ki validity (TTL)
  );

  // Demo response: Real environment mein SMS gateway integrate hota hai
  res.json({ message: 'OTP sent successfully', otp });
});

// 2. POST Endpoint (/otp/verify) — Request body se user-submitted OTP ko check karega
app.post('/otp/verify', async (req, res) => {
  const { phone, otp } = req.body;
  
  // Redis database se key ke against value fetch kari
  const savedOtp = await redis.get(getOtpKey(phone));

  // Case 1: Agar key exist nahi karti (ya to kabhi bani nahi ya 30s ke bad expire ho gayi)
  if (!savedOtp) {
    return res.status(400).json({ message: 'OTP expired or not found' });
  }

  // Case 2: Agar user ka input OTP aur stored OTP mismatch ho jaye
  if (savedOtp !== String(otp)) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // Case 3: Match hone par key delete (taaki ek OTP baar-baar use na ho sake)
  await redis.del(getOtpKey(phone));

  // Successful verification response
  res.json({ message: 'OTP verified successfully' });
});

// 3. GET Endpoint (/otp/:phone/ttl) — Check karne ke liye ki OTP expiry mein kitna time (TTL) baaki hai
app.get('/otp/:phone/ttl', async (req, res) => {
  // redis.ttl() key ka exact remaining time seconds mein return karta hai.
  // Outputs: positive value = remaining seconds, -1 = no expiry, -2 = key not found/expired
  const ttl = await redis.ttl(getOtpKey(req.params.phone));
  res.json({ ttl });
});

// Server starts listening on http://localhost:3000
app.listen(3000, () => console.log('Server: http://localhost:3000'));