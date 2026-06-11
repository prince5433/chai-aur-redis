# 🔴 Redis — Complete Notes (Hinglish)
> *Chai aur Code series — Advanced Backend*

---

## ⚠️ Warning: Opinions Ahead

Yahan jo bhi bataya jayega wo **standard opinions** hain. Challenge kiye ja sakte hain kyunki databases bahut fast evolve ho rahe hain aaj kal. PostgreSQL bhi Redis jaisa kaam kar sakta hai kuch cases mein. So, open mind rakho.

---

## 🏪 Redis Kya Hai? — Analogy

Socho ek **kiryana store** hai. Tum gaye aur pucha:

> *"Chai ki price kya hai?"*

Store wala gaya **back store** mein → register uthaya → list dekhi → price laaya → tumhe bataya.

Pehli baar → theek hai.  
Doosri baar same sawaal → wapas gaya register ke paas.  
**10,000 baar** same sawaal? 🥵 Problem!

**Solution?** — Ek **board** rakh do counter pe. Uspe likho:

```
Chai = ₹20
```

Ab har baar koi aaye → board dekho → answer do. **Fast!**

> 💡 **Yahi board hai Redis.**

---

## 📌 Redis Kya Hai — Technical Summary

| Property | Detail |
|---|---|
| Type | In-Memory Store (Key-Value) |
| Speed | Lightning Fast ⚡ |
| Persistence | Optional (restart pe data reload ho sakta hai) |
| Replacement for DB? | ❌ Kabhi Nahi |
| Common Names | In-memory store, hashmap store, caching layer |

**In-Memory ka matlab:**
- Data **RAM** mein hota hai → disk se nahi uthana padta → isliye fast
- Restart pe data jaata hai → **BUT** Redis persistence mechanism deta hai wapas load karne ka

---

## 🏗️ Basic Architecture

```
USER
  |
  v
BACKEND APP  ←→  REDIS (In-Memory)
                    |
                    | (cache miss hone pe)
                    v
                 DATABASE (MongoDB / PostgreSQL / MySQL)
                 [★ Truth Source]
```

**Flow:**
1. User request aaya Backend pe
2. Backend pehle **Redis** check karta hai
3. **Cache Hit** → Redis se hi directly respond ✅ (fast)
4. **Cache Miss** → DB se data laao, Redis mein store karo, phir respond

> ⚠️ **Golden Rule:** Redis kabhi bhi **database ka replacement nahi hai**. DB hi tumhara **"ultimate truth source"** hai.

---

## 🌐 Network Latency — Dhyan Rakho

```
[Backend] ----network---- [Redis] ----network---- [DB]
```

- Redis bahar hai network ke → network latency toh lagegi hi
- Agar sab **same VPC** (same network) mein hain → toh fast hai
- Agar Redis **application ke andar** hi hai → ridiculously fast (but rare case)

> Network call toh hogi hi. In-memory fast hai isliye **comparison mein** fast lagta hai.

---

## 🎯 Redis ke Use Cases

### 1. 🗄️ Caching

```
CLIENT → REDIS → (miss hone pe) → DB
                ↑
          (wapas store)
```

- Swiggy/Zomato ka restaurant menu → bar bar DB se nahi aata → **Redis cache** se aata hai
- "Hot records" (frequently accessed data) → Redis mein rakh do
- **Read pressure reduce** hoti hai DB pe

---

### 2. 👤 Session Store

```
SERVER A ─┐
          ├──→ REDIS (sessions store)
SERVER B ─┘
```

- Multiple servers hain → sab ek hi Redis se session check karein
- `session:userId` → JSON data (userId, email, role)
- User logout → Redis + DB dono update

---

### 3. 🔢 OTP Store

```
CLIENT → request OTP → REDIS (TTL = 3 min) → OTP bhej do
       → validate OTP → Redis se check karo
```

- OTP sirf 5-10 min valid hota hai → **DB mein permanently rakhne ki zarurat nahi**
- TTL set karo → auto-delete ho jaata hai
- Redis crash? → User dobara OTP request kar lega. No big deal.

---

### 4. 🚦 Rate Limiting

```
IP: x.x.x.x → count: 6 → TTL: 10 min (BLOCKED)
```

- Bar bar login attempt karne walo ko block karo
- IP ke against counter rakho Redis mein
- Count exceed hua → `cooldown: true`, TTL = 10 min
- TTL khatam → record auto-delete → user unblocked
- **DB hit ki zarurat hi nahi!**

---

### 5. 📋 Job Queue (Background Jobs)

```
LIST: [batch1(10 users), batch2(10 users), batch3(10 users)...]
         ↑
      WORKER (Node app) → emails bhejo → success/fail DB mein likho
```

- Email bhejna time-consuming task hai
- Redis mein ek list/queue banao
- **Workers** (normal backend apps) list mein se data uthate hain aur process karte hain
- Worker = ek aur backend application — kuch alag nahi hota

> 💡 **Worker = Normal backend application hi hai**, sirf iska kaam specific hai (emails, notifications, reports etc.)

---

## 🔑 Key-Value Structure

Redis mein data **key-value pairs** mein store hota hai.

### Key Naming Convention
```
# Products cache
products:all        → [ {id:1, name:"chai"}, {id:2, ...} ]
products:hot        → [ {id:1, ...} ]

# OTP
otp:9876543210     → "434343"

# Session
session:userId:abc123 → { userId: 4, email: "x@y.com", role: "user" }
```

**Rules for keys:**
- ✅ Human readable rakho
- ✅ Colon (`:`) se namespace banao
- ✅ Collisions avoid karo
- ✅ Debugging ke liye easy raho

---

## ⏳ TTL — Time To Live

```
t=0 sec ──────── t=90 sec ──────── t=180 sec
   |                  |
  SET               EXPIRED ❌ (auto-delete)
  OTP
```

- Har key ke saath TTL set kar sakte ho
- TTL khatam → **auto-delete / invalidate**
- OTP, sessions, rate-limit records — sab ke liye useful
- Redis khud cleanup karta hai → tumhe kuch nahi karna

---

## ❌ Redis Kahan Use Nahi Karna

> **"Redis solution for every problem nahi hai!"**

```
❌ MongoDB ki jagah Redis laga do  → WRONG
❌ Har API pe caching lagao        → WRONG
❌ Permanent data Redis mein rakho → WRONG
```

---

## ✅ Checklist — Redis Use Karo Agar...

| Question | Agar Haan → Redis Consider Karo |
|---|---|
| Read pressure reduce karni hai? | ✅ Caching |
| Temporary/expiring data store karna hai? | ✅ OTP, sessions, tokens |
| Shared counter chahiye? | ✅ Rate limiting, page views, likes |
| Background jobs handle karni hain? | ✅ Job queues (email, notifications, reports) |

> ⚠️ **Guarantee nahi hai** — problem ko pehle samjho, phir Redis ka decision lo.

---

## 👨‍👩‍👧‍👦 Redis ke Bhai Bandhu (Alternatives)

| Name | Key Point |
|---|---|
| **KeyDB** | Fully open source, faster, drop-in replacement |
| **DragonflyDB** | Instacart, Meesho use karte hain |
| **Valkey** | Redis license fiasco ke baad popular hua, AWS support |
| **Memcached** | Simple caching, apne pros/cons hain |
| **Upstash** | Platform hai jo Redis deta hai (+ queues bhi) |

> 💡 **Drop-in replacement** = sirf env variable mein URL change karo → saara code as-is chalega

---

## 📝 Quick Revision

```
Redis = In-Memory Key-Value Store
      = Lightning Fast
      = DB ka replacement NAHI hai
      = Caching + Sessions + OTP + Rate Limiting + Job Queues

TTL   = Time To Live = auto-expiry of keys

Cache Miss → DB se laao → Redis mein store karo
Cache Hit  → Redis se directly do
```

---

*Next: Redis install karna + Docker setup + actual commands 🚀*


# 🔴 Redis — Setup & Local Development Notes (Hinglish)
> *Chai aur Code series — Video 2: Practical Setup*

---

## 📌 Is Video Ka Goal

- Redis ko locally Docker se run karna
- Node.js se Redis se connect karna (`ioredis` package)
- Ping-Pong test karna — connection verify karna
- MongoDB bhi saath mein setup karna

> ⚠️ Redis ka kisi bhi database se koi lena dena nahi hai. MongoDB use karo ya PostgreSQL ya MySQL — Redis independently kaam karta hai. Hum sirf MongoDB convenience ke liye le rahe hain series mein.

---

## 🐳 Docker Setup

### Kyun Docker?

- Redis ke online services bhi milti hain (jaise MongoDB Atlas)
- **Learning ke liye Docker best hai** — local, fast, no cost
- Sirf Docker Desktop install hona chahiye — baaki sab hum karenge

---

### 📁 Folder Structure

```
chai-aur-redis/
├── docker-compose.yml        ← sabse important file
├── package.json
└── 01-foundation-of-redis/
    └── src/
        └── index.js
```

---

### 🐳 `docker-compose.yml`

```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: chai-aur-redis
    ports:
      - "6379:6379"
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis-data:/data

  mongo:
    image: mongo:7
    container_name: chai-aur-mongo
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: chai_aur_redis_db
    volumes:
      - mongo-data:/data/db

volumes:
  redis-data:
  mongo-data:
```

**Line by line samjho:**

| Config | Kya karta hai |
|---|---|
| `image: redis:7-alpine` | Alpine = lightweight image. Series mein 7-alpine use kiya |
| `container_name` | Docker dashboard mein naam se pehchano |
| `ports: "6379:6379"` | Tumhara machine ka port 6379 → container ka port 6379 |
| `--appendonly yes` | Append-only mode — records aage likhte jao, data safe rahega |
| `volumes` | Container restart hone pe bhi data survive kare |
| `MONGO_INITDB_DATABASE` | Default database ka naam set karna |

> 💡 **Port 6379** = Redis ka default port. Change karne ki zarurat nahi, seedha use karo.

---

### ▶️ Containers Start Karna

```bash
# Same folder mein jahan docker-compose.yml hai
docker compose up

# Background mein chalana ho (detach mode)
docker compose up -d
```

- Pehli baar **images download** hongi (~280MB) — thoda time lagega
- Baad mein fast start hoga
- Docker Desktop → Dashboard mein dono containers running dikhenge

---

## 📦 Node.js Dependencies

```json
{
  "dependencies": {
    "express": "^4.x",
    "ioredis": "^5.x",
    "mongoose": "^8.x"
  },
  "type": "module"
}
```

| Package | Kaam |
|---|---|
| `express` | HTTP server |
| `ioredis` | Redis se baat karne ke liye — JS ecosystem mein most famous package |
| `mongoose` | MongoDB ODM |

> `ioredis` akela nahi hai — aur bhi Redis packages hain JS mein, par ye sabse popular hai.

```bash
bun install   # ya npm install ya pnpm install
```

---

## 💻 Code — `src/index.js`

```js
import express from 'express'
import Redis from 'ioredis'
import mongoose from 'mongoose'

const app = express()

// Redis Client banana
const redis = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379'
)

// Redis Ping-Pong test
app.get('/redis', async (req, res) => {
  const reply = await redis.ping()
  res.json({ redis: reply })  // "PONG" aayega
})

// MongoDB connection test
app.get('/mongo', async (req, res) => {
  const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/chai_aur_redis_db'
  await mongoose.connect(mongoURL)
  res.json({
    mongo: 'connected',
    database: mongoose.connection.db.databaseName
  })
})

app.listen(3000, () => console.log('Server running on port 3000'))
```

---

## 🔑 Redis Client — Key Points

```js
// Basic client — URL se connect
const redis = new Redis('redis://localhost:6379')

// Production mein env variable se lena
const redis = new Redis(process.env.REDIS_URL)
```

- `new Redis()` — ioredis ka constructor
- Isme bahut saare parameters daal sakte ho (hover karke dekho IDE mein)
- **Sabse common** = URL dena

> 💡 Jaise MongoDB ka ek connection file banaate ho aur jahan chahiye import karte ho — **Redis client bhi waisa hi** banao aur export karo.

---

## 🧪 Testing — Ping-Pong

API client (Postman / WebRequestKit / Thunder Client) se:

```
GET http://localhost:3000/redis
```

**Response:**
```json
{ "redis": "PONG" }
```

```
GET http://localhost:3000/mongo
```

**Response:**
```json
{
  "mongo": "connected",
  "database": "chai_aur_redis_db"
}
```

> ⚡ Redis response ~14ms locally — network latency nahi hoti jab Docker same machine pe ho.

---

## ⚡ `--appendonly yes` Kya Hota Hai?

```
Normal mode:   RAM mein hi → restart pe data GONE ❌
Appendonly:    Har write → file mein bhi log hota hai
               Restart pe → file se wapas load → data SAFE ✅
```

Ye Redis ki **persistence** feature hai. Production mein mostly on rakhte hain.

---

## 📝 Quick Revision

```
Setup Steps:
1. docker-compose.yml banao (redis + mongo services)
2. docker compose up
3. npm install (ioredis, express, mongoose)
4. new Redis('redis://localhost:6379') → client ready
5. redis.ping() → "PONG" → connected ✅

Default Ports:
  Redis   → 6379
  MongoDB → 27017

ioredis = JS mein Redis se baat karne ka sabse popular package
```

---

*Next Video: Redis mein cheezein kaise store hoti hain — data types, commands, aur aur possibilities 🚀*


# 🔴 Redis — Basics & CRUD Commands (Hinglish)
> *Chai aur Code series — Video 3: Site Banner Project*

---

## 🎯 Is Video Ka Goal

**Real-world project:** Website Banner (Hello Bar) — Redis se serve karna

> Wo popup banner jo websites pe top mein dikhta hai — discount, warning, announcement — yahi banana hai.

**Kyun Redis?**
- Har page reload pe banner dikhta hai → **bahut zyada read requests**
- Har baar DB se kyun laana? → Redis se fata-fat lo
- Info DB mein store hoti hai, **serve Redis se hota hai**

> 💡 Static bhi kar sakte hain, lekin yahan banner change hota rehta hai. Isliye Redis + DB combo better hai.

---

## 📁 Project Structure

```
03-site-banner/
├── package.json
└── src/
    └── index.js
```

**Dependencies** (same as before, minus mongoose):
```json
{
  "dependencies": {
    "express": "^4.x",
    "ioredis": "^5.x"
  },
  "type": "module"
}
```

Mongoose hataya kyunki abhi **sirf Redis se interact** karenge — DB baad mein aayega.

---

## 💻 Code — `src/index.js`

```js
import express from 'express'
import Redis from 'ioredis'

const app = express()
app.use(express.json())  // body parse karne ke liye

// Redis client
const redis = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379'
)

// Key constant — ek jagah define karo, sab jagah use karo
const BANNER_KEY = 'app:banner'

// POST /banner — set karo
app.post('/banner', async (req, res) => {
  const message = req.body.message || 'Welcome to our website'
  await redis.set(BANNER_KEY, message)
  res.json({ success: true })
})

// GET /banner — get karo
app.get('/banner', async (req, res) => {
  const message = await redis.get(BANNER_KEY)
  res.json({ message })
})

// DELETE /banner — delete karo
app.delete('/banner', async (req, res) => {
  await redis.del(BANNER_KEY)
  res.json({ success: true })
})

// GET /banner/exists — exist karta hai?
app.get('/banner/exists', async (req, res) => {
  const exists = Boolean(await redis.exists(BANNER_KEY))
  res.json({ exists })
})

app.listen(3000, () => console.log('Server running on port 3000'))
```

---

## 🔑 4 Core Redis Commands

| Command | Kaam | Example |
|---|---|---|
| `redis.set(key, value)` | Key-value store karo | `redis.set('app:banner', 'Hello!')` |
| `redis.get(key)` | Value laao | `redis.get('app:banner')` |
| `redis.del(key)` | Key delete karo | `redis.del('app:banner')` |
| `redis.exists(key)` | Key exist karti hai? | `redis.exists('app:banner')` |

---

## 🗝️ Key Naming — Best Practice

```
❌ banner          → generic, collision risk
❌ BANNER          → readable nahi
✅ app:banner      → namespace:resource
✅ app:banner:hot  → aur specific
```

**Standard:**
- **Colon (`:`)** se namespace banao
- Constants file ya enum mein define karo → typo se bachao
- Human readable rakho → debugging easy

```js
// Constants file mein rakhna best practice hai
const BANNER_KEY = 'app:banner'
// Fir jahan chahiye import karo
```

---

## 🔍 `exists` — Kyun Important Hai?

Kabhi bhi value fetch karne se pehle **exist check karo:**

```js
// Pattern jo follow karna chahiye
const exists = await redis.exists(BANNER_KEY)

if (exists) {
  const value = await redis.get(BANNER_KEY)  // Redis se lo
  return res.json({ value })
} else {
  const value = await db.findBanner()        // DB se lo
  await redis.set(BANNER_KEY, value)         // Cache karo
  return res.json({ value })
}
```

> 💡 `redis.exists()` number return karta hai (1 = exists, 0 = nahi) — isliye `Boolean()` mein convert karo for clean response.

---

## 🧪 API Testing

```
# Banner set karo
POST /banner
Body: { "message": "Welcome to Chai aur Redis Playlist!" }
→ { "success": true }

# Banner get karo
GET /banner
→ { "message": "Welcome to Chai aur Redis Playlist!" }

# Exist karta hai?
GET /banner/exists
→ { "exists": true }

# Delete karo
DELETE /banner
→ { "success": true }
```

---

## ⚠️ Common Mistake — AI Suggestions

```js
// ❌ Galat — AI ne ioredis suggest nahi kiya
import Redis from 'redis'

// ✅ Sahi
import Redis from 'ioredis'
```

> AI suggestions blindly mat lo — **debug karna aana chahiye**. Error se hi seekhte hain.

---

## 📝 Quick Revision

```
4 Commands yaad rakho:
  set()    → store karo
  get()    → laao
  del()    → delete karo
  exists() → check karo

Key naming: namespace:resource → "app:banner"
Constants file mein keys define karo → reuse + no typos

Flow:
  Request aaya → Redis check karo (exists?)
  ├── YES → Redis se value lo → respond
  └── NO  → DB se lo → Redis mein store karo → respond
```

---

## 🎯 Assignment

`redis.exists()` ko **bina Boolean() ke** directly bhejo response mein. Dekho kya aata hai. Comment mein batao! 👇

---

*Next Video: Product API banana with Redis caching — aur interesting project! 🚀*