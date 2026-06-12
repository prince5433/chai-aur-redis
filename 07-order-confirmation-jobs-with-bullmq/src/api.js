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
