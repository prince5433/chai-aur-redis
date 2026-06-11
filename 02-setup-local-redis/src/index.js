// Express framework import kar rahe hain routing aur API endpoints handle karne ke liye
import express from "express";

// Mongoose import kar rahe hain MongoDB database se connect karne ke liye
import mongoose from "mongoose";

// ioredis client import kar rahe hain Redis server ke saath communicate karne ke liye
import Redis from "ioredis";

// Express application ka instance create kiya
const app = express();

// Application kis port par chalegi wo define kiya
const PORT = 3000;

// MongoDB database ke saath connection establish kiya
mongoose.connect("mongodb://localhost:27017/redis-project");

// Redis client ko initialize kiya. Agar environment variable REDIS_URL present hai toh use use karega, nahi toh default localhost:6379 se connect karega
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Redis connection error event listener to catch and print ECONNRESET errors gracefully
redis.on('error', (err) => {
  console.warn('Redis connection issue:', err.message);
});

// Default Route (/) - Jab user root URL hit kare toh available routes ki information milegi
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the Redis/Mongo API!",
        endpoints: {
            redis: "/redis",
            mongo: "/mongo"
        }
    });
});

// Redis Endpoint (/redis) - Isme Redis server ko PING request bhejte hain check karne ke liye ki Redis operational hai ya nahi
app.get('/redis', async (req, res) => {
    // redis.ping() 'PONG' return karta hai agar connection active ho
    const reply = await redis.ping();
    res.json({ redis: reply });
});

// MongoDB Endpoint (/mongo) - Database connection status aur database ka naam check karne ke liye
app.get('/mongo', async (req, res) => {
    // Agar standard environment variable predefined hai toh use karein, warna local URI use karein
    const url = process.env.MONGODB_URI || "mongodb://localhost:27017/chai_aur_redis";
    
    // Agar connection connected nahi hai (readyState === 0), toh connect karein
    if (mongoose.connection.readyState === 0) {
       await mongoose.connect(url);
    }
    
    // Response mein current connection status aur database ka naam return karein
    res.json({ mongo: "connected", database: mongoose.connection.name });
});

// Server ko specify kiye gaye PORT par listen mode mein start kar rahe hain
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});