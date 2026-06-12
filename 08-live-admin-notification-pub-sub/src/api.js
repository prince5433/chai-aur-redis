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