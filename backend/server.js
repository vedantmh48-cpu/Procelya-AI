import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import workflowRoutes from './routes/workflowRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/procelya'

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ backend: true, database: true, realtime: true })
})

// API routes
app.use('/api/workflow', workflowRoutes)

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: err.message })
})

async function start() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB connected')

    app.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err.message)
    process.exit(1)
  }
}

start()