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
