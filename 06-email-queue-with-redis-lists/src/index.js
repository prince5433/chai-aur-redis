import express from 'express'
import Redis from 'ioredis'

const app = express()
app.use(express.json())

const redis = new Redis(
  process.env.REDIS_URL || 'redis://127.0.0.1:6379'
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