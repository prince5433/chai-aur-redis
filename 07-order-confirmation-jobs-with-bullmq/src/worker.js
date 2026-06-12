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