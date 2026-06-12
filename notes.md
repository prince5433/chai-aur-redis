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

# 🔴 Redis — TTL (Time To Live) + OTP Project (Hinglish)
> *Chai aur Code series — Video 4: Login with OTP using TTL*

---

## 🎯 Is Video Ka Goal

Redis ki **superpower — TTL (Time To Live)** — samajhna aur use karna.

**Project:** OTP-based Login — Redis se OTP store, verify, aur auto-expire karna.

---

## ⏳ TTL Kya Hai? — Redis Ka Superpower

> *"Koi bhi key aap Redis mein set karo — wo kitni der tak rahegi?"*

```
t = 0 sec   →  OTP set kiya (TTL = 30 sec)
t = 20 sec  →  TTL bacha = 10 sec
t = 30 sec  →  KEY AUTO-DELETE ✅ (expired)
t = 31 sec  →  redis.get() → null, redis.ttl() → -2
```

**-2 ka matlab:** Key exist nahi karti (expire ho gayi ya kabhi thi hi nahi)  
**-1 ka matlab:** Key exist karti hai lekin **koi TTL set nahi** hai

---

## 🔑 Dynamic Key Generation — Helper Function

Jab key **dynamic** ho (user-specific), tab constant ki jagah **helper function** banate hain:

```js
// Static key (constants file mein)
const BANNER_KEY = 'app:banner'

// Dynamic key (helper function se)
const getOtpKey = (phone) => `otp:${phone}`
// Example: getOtpKey('9898989898') → "otp:9898989898"
```

**Kyun function?**
- Reliability — har jagah same format guarantee
- Reusability — import karo, call karo
- Corporate standard — production code mein yahi hota hai

---

## 💻 Code — `src/index.js`

```js
import express from 'express'
import Redis from 'ioredis'

const app = express()
app.use(express.json())

const redis = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379'
)

// Helper: dynamic key generator
const getOtpKey = (phone) => `otp:${phone}`

// 1. POST /otp — OTP generate karke Redis mein store karo
app.post('/otp', async (req, res) => {
  const { phone } = req.body
  const otp = Math.floor(1000 + Math.random() * 9000)  // 4-digit OTP

  await redis.set(
    getOtpKey(phone),   // key: "otp:9898989898"
    otp,                // value: 4321
    'EX',               // EX = seconds mein expire
    30                  // 30 seconds TTL
  )

  // Production mein: SMS service se bhejo (Twilio, MSG91, etc.)
  res.json({ otp })  // Demo ke liye direct bhej rahe hain
})

// 2. POST /otp/verify — OTP verify karo
app.post('/otp/verify', async (req, res) => {
  const { phone, otp } = req.body
  const savedOtp = await redis.get(getOtpKey(phone))

  if (!savedOtp) {
    return res.status(400).json({ message: 'OTP expired or not found' })
  }

  if (savedOtp !== String(otp)) {
    return res.status(400).json({ message: 'Invalid OTP' })
  }

  // OTP match! Delete from Redis (ek baar use ho gaya)
  await redis.del(getOtpKey(phone))

  // Yahan: DB mein user verify mark karo, session banao, JWT bhejo
  res.json({ message: 'OTP verified successfully' })
})

// 3. GET /otp/:phone/ttl — TTL check karo
app.get('/otp/:phone/ttl', async (req, res) => {
  const ttl = await redis.ttl(getOtpKey(req.params.phone))
  res.json({ ttl })
})

app.listen(3000, () => console.log('Server: http://localhost:3000'))
```

---

## 🔥 `redis.set()` with TTL — Syntax

```js
// Bina TTL ke (permanent)
await redis.set('key', 'value')

// TTL ke saath — EX = seconds
await redis.set('key', 'value', 'EX', 30)

// TTL ke saath — PX = milliseconds
await redis.set('key', 'value', 'PX', 30000)
```

**Internally kaise store hota hai:**

```
Key:   "otp:9898989898"
Value: "4321"
Meta:  expiry = <timestamp + 30sec>   ← yahi TTL hai
```

> Value aur TTL alag-alag store hote hain. `redis.get()` sirf value deta hai, `redis.ttl()` sirf time bacha hua.

---

## 🧪 `redis.ttl()` — Time Remaining Check

```js
const ttl = await redis.ttl('otp:9898989898')
// Returns:
//  25   → 25 seconds baaki hain
//   0   → abhi expire hoga
//  -1   → key hai but TTL set nahi
//  -2   → key exist nahi karti (expire ho gayi)
```

**Use case:** Frontend ko countdown timer dikhana, ya validate karna ki OTP abhi valid hai.

---

## 🏭 Production-Grade OTP Data (Advanced)

Simple OTP ke alawa, real production mein ye bhi store karte hain:

```js
// Complex value — JSON stringify karke rakho
const otpData = {
  otp: 4321,
  attempts: 0,          // kitni baar galat daala
  maxAttempts: 3,       // 3 se zyada galat → block
  createdAt: Date.now(),        // debugging ke liye
  lastAttemptedAt: null,        // brute-force check
  blockUntil: null              // rate limiting
}

await redis.set(getOtpKey(phone), JSON.stringify(otpData), 'EX', 300)

// Get karte waqt parse karo
const raw = await redis.get(getOtpKey(phone))
const data = JSON.parse(raw)
```

> Yahi hai Redis mein "value" ki asli power — sirf ek string nahi, poora JSON object rakh sakte ho!

---

## 🔄 OTP Flow — Complete

```
USER                    BACKEND                 REDIS
 |                          |                     |
 |-- POST /otp {phone} ---> |                     |
 |                          |-- SET otp:phone ---> |
 |                          |   value=4321         |
 |                          |   EX=30              |
 |<-- { otp: 4321 } -----  |                     |
 |   (SMS mein aata)        |                     |
 |                          |                     |
 |-- POST /otp/verify ----> |                     |
 |   {phone, otp: 4321}     |-- GET otp:phone ---> |
 |                          |<-- "4321" ---------- |
 |                          |-- DEL otp:phone ---> |
 |<-- "OTP verified" ------ |                     |
```

---

## 📝 Quick Revision

```
TTL set karna:
  redis.set(key, value, 'EX', seconds)

TTL check karna:
  redis.ttl(key)
  → positive = seconds baaki
  → -1 = no TTL
  → -2 = key nahi hai

OTP Pattern:
  Key   = otp:<phone>          (dynamic, helper function se)
  Value = otp number
  TTL   = 30-300 seconds

Verify ke baad:
  redis.del(key) karo — ek baar use hone ke baad hatao

Value mein sirf string nahi — poora JSON object bhi rakh sakte ho!
```

---

## 🧠 Key Naming — Static vs Dynamic

| Situation | Approach | Example |
|---|---|---|
| Fixed key (ek hi hoga) | Constant | `const BANNER_KEY = 'app:banner'` |
| User-specific key | Helper function | `getOtpKey(phone)` → `'otp:9898989898'` |

---

*Next Video: Product API with Redis caching — DB + Redis integration! 🚀*

# Redis - User Profile Caching: Hash vs JSON 🗂️

> **Topic:** Redis mein User Profile store karna — JSON String vs Hash  
> **Playlist:** Chai aur Redis  
> **Level:** Intermediate

---

## 📌 Ye Video Kya Cover Karta Hai?

Is video mein **do tarike** bataye gaye hain Redis mein data store karne ke:

1. **`SET` command** → Simple JSON string store karna
2. **`HSET` command** → Hash (Object) ke form mein store karna

Interview mein yahi distinguish karta hai ki tumne **practically Redis use kiya hai ya sirf padha hai.**

---

## 🔑 Core Concept: Redis mein Data Rakhne ke 2 Tarike

### 1️⃣ SET Command (JSON String approach)

```
Store karta hai: Single Variable / String
```

- Sabse **basic aur default** method
- Poori value ek **string ke roop mein** store hoti hai
- Update karne ke liye **poori string replace** karni padti hai (partial update possible nahi)
- Data retrieve karte waqt **`JSON.parse()`** karna padta hai

#### Code Example:

```js
// POST - Data save karna (JSON String)
app.post('/user/:id/json', async (req, res) => {
  const key = `user:${req.params.id}:json`;
  await redis.set(key, JSON.stringify(req.body)); // string mein convert karna padta hai
  res.json({ status: "saved as json" });
});

// GET - Data retrieve karna
app.get('/user/:id/json', async (req, res) => {
  const key = `user:${req.params.id}:json`;
  const raw = await redis.get(key);
  res.json({ user: raw ? JSON.parse(raw) : null }); // parse karna padta hai wapas
});
```

**⚠️ Problem:** DB mein poora data ek string hai. Edit/update karna ho toh **naya object dalna padta hai** — DSA skills lagane ki koi zaroorat nahi aur sense bhi nahi.

---

### 2️⃣ HSET Command (Hash approach)

```
Store karta hai: Object (key-value pairs)
```

- Data **ek structured object** ki tarah store hota hai
- **Single field update** possible hai — poora object replace nahi karna padta
- Data retrieve karte waqt **`JSON.parse()` ki zaroorat nahi**
- Production mein yahi **zyada use hota hai** user profiles ke liye

#### Code Example:

```js
// POST - Data save karna (Hash)
app.post('/user/:id/hash', async (req, res) => {
  const key = `user:${req.params.id}:hash`;
  await redis.hset(key, req.body); // directly object de do, stringify nahi
  res.json({ status: "saved as hash" });
});

// GET - Data retrieve karna
app.get('/user/:id/hash', async (req, res) => {
  const key = `user:${req.params.id}:hash`;
  const user = await redis.hgetall(key); // poora object ek baar mein
  res.json({ user });
});
```

**✅ Advantage:** Directly object milta hai. No parsing needed. Clean code!

---

## 🛠️ Important Redis Hash Commands (HSET family)

| Command | Kaam kya karta hai |
|---|---|
| `HSET key field value` | Ek ya zyada fields set karo |
| `HGET key field` | **Single field** ki value lo |
| `HGETALL key` | **Poora object** lo (most used ✅) |
| `HDEL key field` | Specific field delete karo |
| `HEXISTS key field` | Check karo ki field exist karti hai ya nahi |

> 💡 **Interview Tip:** `HGETALL` sabse zyada use hota hai kyunki Redis mein itna zyada data hota nahi. Mostly poora object hi chahiye hota hai.

---

## ⚔️ JSON String vs Hash — Quick Comparison

| Feature | SET (JSON String) | HSET (Hash) |
|---|---|---|
| Storage format | String | Object (key-value) |
| Partial update | ❌ Nahi | ✅ Haan |
| Parse required? | ✅ Haan (`JSON.parse`) | ❌ Nahi |
| Memory efficiency | Thoda zyada | Better |
| Production use | Basic caching | User profiles, sessions ✅ |
| Increment/Decrement fields | ❌ | ✅ (e.g., like count) |

---

## 🏗️ Project Setup (Boilerplate)

```js
import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

const redis = new Redis(); // localhost default ya process.env se

// ... routes yahan aate hain

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
```

**Tech Stack used:**
- `express` — HTTP server
- `ioredis` — Redis client for Node.js
- `Docker` — Redis locally run karne ke liye

---

## 🎯 Key Takeaways (Interview ke liye yaad rakho)

1. **`SET` vs `HSET`** ka difference pata hona chahiye — yahi interview mein pakadta hai
2. `HSET` use karo jab **object/structured data** store karna ho
3. `HGETALL` use karo jab **poora object** chahiye ho (90% cases mein yehi)
4. `SET` mein update = **complete replace** | `HSET` mein update = **partial possible**
5. Hash mein **individual fields increment/decrement** bhi kar sakte ho (like counts, view counts, etc.)
6. Redis complex nahi hai — bas ek **thoda sa darr** baitha hota hai, nikaal do usse

---

## 📂 Folder Structure (Is Project Ki)

```
05-project/
├── package.json
└── src/
    └── index.js
```

---

> **Next Video:** Agle concepts ke liye playlist follow karo 🚀  
> **Practice:** Khud ye endpoints Postman/Thunder Client mein test karo — tabhi concept permanently embed hoga!

# 🔴 Redis — Queue System (LPUSH / RPOP) (Hinglish)
> *Chai aur Code series — Video 6: Redis as a Job Queue*

---

## 🎯 Is Video Ka Goal

Redis ko **Queue (Q) ki tarah use karna** — raw implementation karna aur uske drawbacks samajhna.

> 💡 Libraries baad mein aayengi. Pehle raw code likho — tabhi pata chalega ki library kyun zaroori hai.

---

## 📋 Queue Kya Hoti Hai? — Concept

```
LPUSH (left se daalo)          RPOP (right se nikalo)

  [C] → [B] → [A]
   ↑                    ↑
 naya                 pehle wala
 aaya                 process hoga

FIFO: First In, First Out
```

**Rule yaad rakho:**
- **Left se PUSH** karo → `lpush`
- **Right se POP** karo → `rpop`

Dono taraf se ho sakta hai, lekin **ek standard follow karo** — warna confusion.

---

## 🏗️ Job Queue Architecture

```
POST /emails  →  Job banao  →  LPUSH queue:email
                                     ↓
GET /emails/process  →  RPOP queue:email  →  Email bhejo
```

**Job kya hoti hai?**
Queue ke andar jo bhi entity daali jaati hai — email, video processing task, report generation — use **"Job"** bolte hain.

---

## 💻 Code — `src/index.js`

```js
import express from 'express'
import Redis from 'ioredis'

const app = express()
app.use(express.json())

const redis = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379'
)

// Queue ka naam — standard practice: queue:purpose
const Q_NAME = 'queue:email'

// POST /emails — job queue mein daalo
app.post('/emails', async (req, res) => {
  const job = {
    to: req.body.to,
    subject: req.body.subject || 'No Subject',
    body: req.body.body,
    createdAt: new Date().toISOString()   // standard: hamesha timestamp rakho
  }

  await redis.lpush(Q_NAME, JSON.stringify(job))  // LEFT se push
  res.json({ queued: true, job })
})

// GET /emails/process — ek job uthao aur process karo
app.get('/emails/process', async (req, res) => {
  const rawJob = await redis.rpop(Q_NAME)   // RIGHT se pop

  if (!rawJob) {
    return res.json({ message: 'Queue is empty' })
  }

  const job = JSON.parse(rawJob)

  // Yahan actual email sending hoti (Twilio SendGrid, Nodemailer, etc.)
  // Simulate kar rahe hain abhi
  console.log('Sending email to:', job.to)

  res.json({ message: 'Email sent', job })
})

app.listen(3000, () => console.log('Server: http://localhost:3000'))
```

---

## 🔑 Queue Commands

| Command | Kaam | Example |
|---|---|---|
| `lpush(key, value)` | Left se daalo | `redis.lpush('queue:email', JSON.stringify(job))` |
| `rpop(key)` | Right se nikalo (process karo) | `redis.rpop('queue:email')` |
| `rpush(key, value)` | Right se daalo | Alternative |
| `lpop(key)` | Left se nikalo | Alternative |

> 💡 **LPUSH + RPOP** = standard FIFO queue  
> **RPUSH + LPOP** = bhi valid hai — bas ek consistent rule follow karo

---

## 🗝️ Queue Key Naming

```js
// Standard practice
const Q_NAME = 'queue:email'

// Aur examples
'queue:notifications'
'queue:video-processing'
'queue:reports'
```

---

## 🧪 API Test

```
# Job queue mein daalo
POST /emails
Body: {
  "to": "hitesh@hitesh.ai",
  "subject": "Chai aur Redis",
  "body": "Welcome to the playlist"
}
→ { "queued": true, "job": {...} }

# Job uthao aur process karo
GET /emails/process
→ { "message": "Email sent", "job": {...} }

# Agar queue empty hai
GET /emails/process
→ { "message": "Queue is empty" }
```

---

## ⚠️ Raw Redis Queue ke Drawbacks

Yahi video ka sabse important part hai. Raw implementation mein **3 bade problems** hain:

### 1. 🔴 Job Loss

```
Worker → RPOP kiya → job gone from Redis
Worker → CRASH ho gaya → email nahi gayi
Job hamesha ke liye lost ❌
```

RPOP karte hi job Redis se hat jaati hai — agar worker fail ho jaaye to **job dobara process nahi hogi.**

---

### 2. 🔴 No Retry Mechanism

```
Email fail hui → koi retry nahi
3 baar try karo → koi system nahi
Dead letter queue → exist nahi karti
```

Agar job fail ho jaaye — **dobara try karne ka koi mechanism nahi** raw Redis queue mein.

---

### 3. 🔴 No Parallel Workers

```
10,000 emails pending → sirf ek worker
Manual trigger → koi background processing nahi
```

Hamare system mein worker ko manually endpoint hit karke trigger karna padta hai. **Background mein automatically process karne ka koi system nahi.**

---

## 📊 Summary — When to Use Raw vs Library

| Feature | Raw Redis Queue | BullMQ / Bull (library) |
|---|---|---|
| Job Loss | ❌ Possible | ✅ Protected |
| Retry | ❌ Nahi | ✅ Auto retry |
| Parallel Workers | ❌ Manual | ✅ Built-in |
| Dead Letter Queue | ❌ Nahi | ✅ Available |
| Complexity | Low | Medium |

> Raw Redis queue tab use karo jab:
> - Simple tasks hain
> - Job loss acceptable hai
> - Production-grade reliability nahi chahiye

---

## 📝 Quick Revision

```
Queue Rule:
  LPUSH → left se daalo (new job)
  RPOP  → right se nikalo (process karo)
  = FIFO order maintain hota hai

Job = queue ke andar ek task/entity
Key = 'queue:purpose'  (standard naming)

JSON.stringify() → lpush karte waqt
JSON.parse()     → rpop ke baad

3 Drawbacks:
  1. Job loss (rpop ke baad crash)
  2. No retry mechanism
  3. No parallel/background workers
```

---

## 🎯 Assignment

Comment mein batao:
- Kya `rpush` bhi hota hai? Kya `lpop` bhi hota hai?
- Kya dusre tarike se bhi queue implement ho sakti hai? Kaise?

---

*Next Video: BullMQ — proper job queue library with retries, parallel workers, and more! 🚀*

# 🔴 Redis — BullMQ: Production-Grade Job Queue (Hinglish)
> *Chai aur Code series — Video 7: BullMQ Queue Infrastructure*

---

## 🎯 Is Video Ka Goal

Raw Redis queue ke drawbacks solve karna — **BullMQ** use karke production-grade queuing system banana.

> 💡 BullMQ ek open-source message queue hai jo **Redis ko backend** ki tarah use karta hai. ~1 decade se industry mein battle-tested hai.

---

## 🏗️ Queue Architecture — Producer/Consumer

```
PRODUCER(s)          MESSAGE QUEUE          CONSUMER(s) / WORKERS
(API server)    →   [Job1][Job2][Job3]   →   Worker1
                                         →   Worker2
                                         →   Worker3
```

| Term | Matlab |
|---|---|
| Producer | Jo queue mein job daalta hai (usually API server) |
| Consumer / Worker | Jo queue se job uthata hai aur process karta hai |
| Job | Queue ke andar ek task (email, video process, report) |
| Queue | Jobs ka waiting area — Redis pe backed |

> **Important:** Queue mein **heavy data nahi rakha jaata**. Sirf task ki detail/ID rakho. Actual data S3 ya DB mein hoga — worker wahan se uthayega.

---

## 📦 Packages

```bash
bun install express bullmq ioredis
```

---

## 📁 File Structure

```
src/
├── q.js        ← Queue + Redis connection define karo
├── worker.js   ← Consumer logic — job process karo
└── api.js      ← Producer — job queue mein daalo
```

---

## 💻 `q.js` — Queue Setup

```js
import { Queue } from 'bullmq'

// Redis connection (BullMQ ko dena padta hai)
const connection = {
  host: 'localhost',
  port: 6379
}

// Queue banao — sirf naam aur connection chahiye
const emailQueue = new Queue('emails', { connection })

export { emailQueue, connection }
```

**Kitni bhi queues bana sakte ho:**
```js
const emailQueue   = new Queue('emails',    { connection })
const orderQueue   = new Queue('orders',    { connection })
const paymentQueue = new Queue('payments',  { connection })
```

---

## 💻 `worker.js` — Consumer

```js
import { Worker } from 'bullmq'
import { connection } from './q.js'

const worker = new Worker(
  'emails',           // 1. Kaun si queue monitor karni hai

  async (job) => {    // 2. Business logic (job mile to kya karo)
    console.log('Processing email job:', job.id, job.name)
    console.log('Job data:', job.data)

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log('Email job complete!')
  },

  { connection }      // 3. Redis connection
)

// Event listeners — minimum yahi 2 lagao hamesha
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed:`, err)
})
```

**3 cheezein sirf chahiye Worker ko:**
1. Queue ka naam
2. Async callback (business logic)
3. Redis connection

---

## 💻 `api.js` — Producer

```js
import express from 'express'
import { emailQueue } from './q.js'

const app = express()
app.use(express.json())

// POST /welcome-email — job queue mein daalo
app.post('/welcome-email', async (req, res) => {
  const job = await emailQueue.add(
    'send-welcome-email',     // job ka naam (no spaces — use hyphens)

    {                         // job data (worker ko milega job.data se)
      to: req.body.to,
      name: req.body.name || 'Learner'
    },

    {                         // configuration
      attempts: 3,            // fail hone pe 3 baar try karo
      backoff: {
        type: 'exponential',  // 1s, 2s, 4s... badhte delay ke saath retry
        delay: 1000
      }
    }
  )

  res.json({ emailAdded: true, jobId: job.id })
})

app.listen(3000, () => console.log('Server: http://localhost:3000'))
```

---

## 🔑 `emailQueue.add()` — 3 Parameters

```js
emailQueue.add(
  'job-name',    // 1. Job naam — hyphen use karo spaces ki jagah
  { data },      // 2. Job data — worker ko job.data se milega
  { config }     // 3. Config — attempts, backoff, delay etc.
)
```

---

## ⚙️ Job Configuration Options

| Option | Kaam | Example |
|---|---|---|
| `attempts` | Fail hone pe kitni baar retry | `attempts: 3` |
| `backoff.type` | Retry strategy | `'exponential'` ya `'fixed'` |
| `backoff.delay` | Base delay (ms) | `delay: 1000` |
| `delay` | Job ko immediately nahi, delay ke baad run karo | `delay: 5000` |
| `removeOnComplete` | Complete hone ke baad queue se hatao | `true` |
| `removeOnFail` | Fail hone ke baad queue se hatao | `false` |

---

## 🔄 BullMQ Flow

```
POST /welcome-email
        |
        ↓
emailQueue.add(name, data, config)
        |
        ↓
   [REDIS QUEUE]
   job1, job2, job3...
        |
        ↓ (worker constantly monitors)
   Worker picks up job
        |
        ↓
   Business logic execute
        |
        ├── SUCCESS → 'completed' event fire
        └── FAIL → retry (if attempts remaining)
                    → 'failed' event fire (if all attempts exhausted)
```

---

## ✅ BullMQ ne Raw Queue ke Problems Solve Kiye

| Problem (Raw Redis) | Solution (BullMQ) |
|---|---|
| Job loss (RPOP ke baad crash) | ✅ Job tab tak queue mein rehti hai jab tak complete na ho |
| No retry | ✅ `attempts` config se auto-retry |
| No parallel workers | ✅ Multiple workers easily — no duplicate processing |
| No backoff | ✅ Exponential backoff built-in |
| Manual trigger | ✅ Workers automatically queue monitor karte hain |

---

## 🧠 Key Concepts

**Worker aur API dono "workers" hain:**
- API = **Producer worker** (jobs daalta hai)
- Worker.js = **Consumer worker** (jobs process karta hai)

**Queue mein kya rakho:**
```
❌ Video file itself       → too heavy
✅ Video ID + S3 URL       → lightweight reference

❌ Full user profile       → unnecessary
✅ userId + task type      → enough for worker to fetch and process
```

**Multiple consumers:**
```js
// Agar load zyada ho to simply 2 workers chalao
const worker1 = new Worker('emails', processJob, { connection })
const worker2 = new Worker('emails', processJob, { connection })
// BullMQ ensure karta hai same job do workers ko nahi milti
```

---

## 📝 Quick Revision

```
BullMQ = Redis-backed production queue library

q.js:
  new Queue('name', { connection }) → queue banao

worker.js:
  new Worker('name', async(job) => { logic }, { connection })
  worker.on('completed', cb)
  worker.on('failed', cb)

api.js:
  queue.add('job-name', data, { attempts, backoff })

Job data:
  job.id    → unique ID
  job.name  → job naam
  job.data  → actual data jo tune diya tha

Raw Redis vs BullMQ:
  Raw   → job loss, no retry, manual trigger
  BullMQ → protected, auto-retry, background processing
```

---

*Next: Redis caching strategies — cache-aside, write-through, eviction policies! 🚀*

# 🔴 Redis — Pub/Sub (Publish / Subscribe) (Hinglish)
> *Chai aur Code series — Video 8: Redis Pub/Sub System*

---

## 🎯 Is Video Ka Goal

Redis ka built-in **Pub/Sub system** samajhna aur implement karna — bina kisi third-party package ke.

> 💡 **Interview mein puchha jaata hai:** "Build your own Pub/Sub with Redis." Yahi is video mein hai.

---

## 🔔 Notification ka Matlab — Broad Definition

> Notification = sirf phone ki "ting" nahi!

Software industry mein **notification = communication** hai:

| Type | Example |
|---|---|
| Email | Welcome mail, OTP, invoice |
| WhatsApp/SMS | Order update, alert |
| In-app badge | Red circle mein "2" |
| Top banner | Sale announcement |
| DB field change | Status update visible to user |

**Pub/Sub = in-app real-time notification ka ek tarika**

---

## 🏗️ Pub/Sub Architecture

```
PUBLISHER                  REDIS                    SUBSCRIBERS
(API server)          [Channel: orders]         Sub A (active) ✅
     |                [Channel: notifs]  →      Sub B (active) ✅
     | publish()           |                    Sub C (inactive) ❌
     └──────────────────→  |                         |
                           |                    Message deliver
                           |                    (only active ones)
```

**Key Rules:**
- Publisher → channel pe message bhejta hai
- Subscriber → channel ko listen karta hai
- Inactive subscriber → message **miss** kar deta hai (no persistence)
- Ek channel pe **multiple subscribers** ho sakte hain
- Ek subscriber **multiple channels** subscribe kar sakta hai

---

## 📁 File Structure

```
src/
├── subscriber.js   ← Channel sun'ta hai
└── api.js          ← Publisher — message bhejta hai
```

---

## 💻 `subscriber.js`

```js
import Redis from 'ioredis'

// Subscriber = normal Redis client (sirf naam alag)
const subscriber = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379'
)

// Channel subscribe karo
subscriber.subscribe('notifications', (err, count) => {
  if (err) {
    console.error('Subscribe failed:', err)
    return
  }
  console.log(`Subscribed successfully to ${count} channel(s)`)
})

// Naya message aane pe
subscriber.on('message', (channel, message) => {
  // Message string format mein aata hai → JSON.parse karo
  const parsed = JSON.parse(message)
  console.log(`Received on [${channel}]:`, parsed)

  // Yahan apna logic likho:
  // - Email trigger karo
  // - DB update karo
  // - WebSocket se frontend ko bhejo
})
```

---

## 💻 `api.js` — Publisher

```js
import express from 'express'
import Redis from 'ioredis'

const app = express()
app.use(express.json())

// Publisher = normal Redis client (sirf naam alag)
const publisher = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379'
)

// POST /notifications — message publish karo
app.post('/notifications', async (req, res) => {
  const payload = {
    title: req.body.title || 'Default Title',
    body: req.body.body,
    createdAt: new Date().toISOString()   // hamesha timestamp rakho
  }

  // Channel pe publish karo — JSON.stringify karna standard practice hai
  await publisher.publish('notifications', JSON.stringify(payload))

  res.json({ notificationSent: true })
})

app.listen(3000, () => console.log('Server: http://localhost:3000'))
```

---

## 🔑 Pub/Sub Methods — Sirf 2

| Method | Kaam | Kaun use karta hai |
|---|---|---|
| `redis.subscribe('channel', cb)` | Channel sun'na shuru karo | Subscriber |
| `redis.publish('channel', message)` | Channel pe message bhejo | Publisher |

---

## 📡 Multiple Channels

```js
// Subscriber — multiple channels sun sakte ho
subscriber.subscribe('notifications', 'orders', 'payments')

// Publisher — alag-alag channels pe bhejo
await publisher.publish('orders', JSON.stringify(orderData))
await publisher.publish('notifications', JSON.stringify(notifData))
```

---

## ⚠️ Pub/Sub vs Queue — Fark Samjho

| Feature | Pub/Sub | Queue (BullMQ) |
|---|---|---|
| Persistence | ❌ Nahi — miss kiya to gone | ✅ Job tab tak hai jab tak process na ho |
| Retry | ❌ Nahi | ✅ Auto retry |
| Active subscribers | Required | Not required |
| Use case | Real-time events | Background jobs |
| Example | Live notifications | Email sending, video processing |

> 💡 **Rule of thumb:**
> - Real-time chahiye → **Pub/Sub**
> - Guaranteed delivery chahiye → **Queue (BullMQ)**

---

## 🧠 Important — Message Format

```js
// Publish karte waqt — ALWAYS stringify karo
await publisher.publish('channel', JSON.stringify(payload))

// Receive karte waqt — ALWAYS parse karo
subscriber.on('message', (channel, message) => {
  const data = JSON.parse(message)   // string → object
})
```

> Reason: Redis internally strings bhejta/leta hai. JSON.stringify/parse se sender aur receiver dono ko object milta hai.

---

## 📝 Quick Revision

```
Pub/Sub = Publisher + Channel + Subscriber

Publisher:
  redis.publish('channel-name', JSON.stringify(data))

Subscriber:
  redis.subscribe('channel-name', callback)
  redis.on('message', (channel, message) => {
    const data = JSON.parse(message)
  })

Channels → multiple ho sakte hain
  'notifications', 'orders', 'payments'

Inactive subscriber → message miss karta hai (no persistence)

Pub/Sub vs Queue:
  Real-time → Pub/Sub
  Guaranteed → Queue
```

---

## 🎯 Interview Question

> **"Build your own Pub/Sub with Redis"**

Answer:
1. Ek Redis client banao — Publisher
2. Doosra Redis client banao — Subscriber
3. `subscriber.subscribe('channel-name')` call karo
4. `subscriber.on('message', handler)` lagao
5. Publisher se `publisher.publish('channel', JSON.stringify(data))` karo
6. Done ✅

---

*Next: Redis caching strategies deep dive! 🚀*

# 🔴 Redis — Live Leaderboard Assignment (Hinglish)
> *Chai aur Code series — Video 9: Final Assignment*

---

## 🎯 Is Video Ka Goal

Series ka **final assignment** — Live Leaderboard banana using Redis Sorted Sets.

> 💡 Leaderboard Redis ka **showcase project** hai. Har Redis alternative apne homepage pe yahi example dikhata hai kyunki yeh Redis ki asli power demonstrate karta hai.

---

## 🏆 Live Leaderboard Kya Hota Hai?

Real-time mein multiple users ke scores track karna — jab bhi koi score change ho, leaderboard turant update ho.

**Examples:**
- Cricket match live scores
- Online game — 10 players ek saath khel rahe hain
- Article views counter — konsa article sabse zyada viewed
- Exam rankings

**Problem with normal DB:**
```
User ka score update karna chahte ho:

1. SELECT user WHERE id = X           ← DB read
2. Calculate new score
3. UPDATE user SET score = Y          ← DB write
   (race condition: koi aur bhi update kar sakta hai!)
4. SELECT * ORDER BY score LIMIT 10   ← leaderboard ke liye
   (expensive query every time!)
```

**Redis se:**
```
redis.zincrby('leaderboard', points, userId)   ← ek command!
redis.zrevrange('leaderboard', 0, 9)           ← top 10 instantly!
```

---

## 🔑 4 Commands — Yaad Karo

| Command | Kaam |
|---|---|
| `redis.incr(key)` | Ek counter increment karo (atomic) |
| `redis.zincrby(key, increment, member)` | Sorted set mein member ka score badhao |
| `redis.zrevrange(key, start, stop)` | Sorted set — high to low order mein range lo |
| `redis.zrevrank(key, member)` | Kisi bhi member ki rank pata karo |

> **Atomic** matlab: ek hi operation mein select + update ho jaata hai. Race condition possible hi nahi.

---

## 📌 API Endpoints — Banane Hain

### 1. `POST /posts/:id/view`
**Kaam:** Ek post ka view count increment karo

```
POST /posts/1/view
→ View count of post 1 ++
```

Ye `incr` use karega. Yahan seekho ki Redis ek command mein kitna kuch karta hai jo DB mein multiple steps leta.

---

### 2. `POST /leaderboard/score`
**Kaam:** Ek user ka score leaderboard mein add/update karo

```
POST /leaderboard/score
Body: { "userId": "user_42", "points": 150 }
→ user_42 ka score += 150
```

Ye `zincrby` use karega.

---

### 3. `GET /leaderboard`
**Kaam:** Top 10 leaders laao

```
GET /leaderboard
→ [
    { userId: "user_5", score: 9800 },
    { userId: "user_12", score: 8750 },
    ...top 10
  ]
```

Ye `zrevrange` use karega. **Koi query nahi, koi filter nahi, koi sort nahi** — sirf ek command.

---

### 4. `GET /leaderboard/:userId/rank`
**Kaam:** Kisi bhi specific user ki rank instantly pata karo

```
GET /leaderboard/user_42/rank
→ { userId: "user_42", rank: 7 }
```

Ye `zrevrank` use karega.

---

## 💻 Starter Code Structure

```
src/
└── index.js
```

```js
import express from 'express'
import Redis from 'ioredis'

const app = express()
app.use(express.json())

const redis = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379'
)

const LEADERBOARD_KEY = 'leaderboard'

// 1. POST /posts/:id/view — view count increment
app.post('/posts/:id/view', async (req, res) => {
  const postKey = `post:${req.params.id}:views`
  const views = await redis.incr(postKey)   // atomic increment
  res.json({ postId: req.params.id, views })
})

// 2. POST /leaderboard/score — score add karo
app.post('/leaderboard/score', async (req, res) => {
  const { userId, points } = req.body
  const newScore = await redis.zincrby(LEADERBOARD_KEY, points, userId)
  res.json({ userId, newScore: parseFloat(newScore) })
})

// 3. GET /leaderboard — top 10
app.get('/leaderboard', async (req, res) => {
  // zrevrange = high score first, 0 to 9 = top 10, WITHSCORES = score bhi do
  const leaders = await redis.zrevrange(LEADERBOARD_KEY, 0, 9, 'WITHSCORES')

  // leaders = ['userId1', '9800', 'userId2', '8750', ...]
  // Isko pair mein convert karo
  const formatted = []
  for (let i = 0; i < leaders.length; i += 2) {
    formatted.push({
      rank: i / 2 + 1,
      userId: leaders[i],
      score: parseFloat(leaders[i + 1])
    })
  }

  res.json({ leaderboard: formatted })
})

// 4. GET /leaderboard/:userId/rank — specific user ki rank
app.get('/leaderboard/:userId/rank', async (req, res) => {
  const { userId } = req.params
  const rank = await redis.zrevrank(LEADERBOARD_KEY, userId)
  // rank null aata hai agar user leaderboard mein hai hi nahi
  res.json({ userId, rank: rank !== null ? rank + 1 : null })
})

app.listen(3000, () => console.log('Server: http://localhost:3000'))
```

---

## ⚡ Redis Sorted Set — Kaise Kaam Karta Hai

```
LEADERBOARD_KEY = 'leaderboard'

Internally ek sorted set maintain hoti hai:
┌──────────────┬────────┐
│ Member       │ Score  │
├──────────────┼────────┤
│ user_5       │ 9800   │
│ user_12      │ 8750   │
│ user_42      │ 4200   │
│ user_7       │ 1500   │
└──────────────┴────────┘

Redis automatically sorted order maintain karta hai.
Naya element add karo ya score update karo —
Redis khud sort kar deta hai. Tumhe kuch nahi karna.
```

---

## 🧪 API Testing Flow

```
# Kuch scores add karo
POST /leaderboard/score  { "userId": "alice", "points": 500 }
POST /leaderboard/score  { "userId": "bob",   "points": 800 }
POST /leaderboard/score  { "userId": "alice", "points": 300 }  ← alice ka score 800 ho gaya

# Top 10 dekho
GET /leaderboard
→ [{ rank:1, userId:"bob", score:800 }, { rank:2, userId:"alice", score:800 }]

# Alice ki rank
GET /leaderboard/alice/rank
→ { userId: "alice", rank: 2 }

# Post views
POST /posts/1/view  → { views: 1 }
POST /posts/1/view  → { views: 2 }
POST /posts/1/view  → { views: 3 }
```

---

## 🧠 `incr` ka Magic — Race Condition Nahi

```
Normal DB mein race condition:
  Thread 1: read score = 100
  Thread 2: read score = 100      ← same time pe padha
  Thread 1: write score = 110
  Thread 2: write score = 115     ← Thread 1 ka update lost! ❌

Redis INCR/ZINCRBY:
  Atomic operation — ek hi step mein read+write
  Thread 1: incr → 110 ✅
  Thread 2: incr → 120 ✅         ← koi data loss nahi
```

---

## 📝 Quick Revision

```
4 Commands:
  incr(key)                        → counter++  (atomic)
  zincrby(key, points, userId)     → sorted set mein score badhao
  zrevrange(key, 0, 9, 'WITHSCORES') → top 10 high-to-low
  zrevrank(key, userId)            → user ki rank (0-indexed)

Leaderboard Key = 'leaderboard'
Post views Key  = 'post:{id}:views'

Sorted Set:
  Auto-sorted by score
  zincrby = ek command mein select+update (no race condition)
  zrevrange = instant top-N (no ORDER BY query needed)
  zrevrank = instant rank (no COUNT query needed)
```

---

## 🎯 Assignment Checklist

- [ ] Docker compose up karo (Redis + MongoDB)
- [ ] 4 endpoints banao
- [ ] `incr`, `zincrby`, `zrevrange`, `zrevrank` — charo use karo
- [ ] Multiple users ke scores add karo aur leaderboard test karo
- [ ] Specific user ki rank verify karo
- [ ] LinkedIn/Twitter pe post karo aur Piyush ko tag karo! 🚀

---

## 🏁 Series Complete — Summary

| Video | Topic |
|---|---|
| 1 | Redis kya hai, use cases, key-value |
| 2 | Docker setup, ioredis, ping-pong |
| 3 | CRUD commands — set, get, del, exists |
| 4 | TTL — OTP system |
| 5 | JSON vs Hash — HSET/HGETALL |
| 6 | Raw Queue — LPUSH/RPOP + drawbacks |
| 7 | BullMQ — production queue |
| 8 | Pub/Sub — real-time notifications |
| 9 | Live Leaderboard assignment |

---

*Chai peete raho, mast raho! ☕🔴*