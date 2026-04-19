import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import listingsRouter from './routes/listings.js'
import pointsRouter from './routes/points.js'
import sponsorRouter from './routes/sponsor.js'
import claudeRouter from './routes/claude.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/listings', listingsRouter)
app.use('/api/points', pointsRouter)
app.use('/api/sponsor', sponsorRouter)
app.use('/api/claude', claudeRouter)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`FULL API running on http://localhost:${PORT}`)
  console.log('In-memory listings loaded — do NOT restart during demo')
})
