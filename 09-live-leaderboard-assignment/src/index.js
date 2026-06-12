import express from 'express'
import Redis from 'ioredis'

const app = express()
app.use(express.json())

const redis = new Redis(
  process.env.REDIS_URL || 'redis://127.0.0.1:6379'
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
