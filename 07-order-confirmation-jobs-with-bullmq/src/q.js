import { Queue } from 'bullmq'

// Redis connection (BullMQ ko dena padta hai)
const connection = {
  host: 'localhost',
  port: 6379
}

// Queue banao — sirf naam aur connection chahiye
const emailQueue = new Queue('emails', { connection })

export { emailQueue, connection }