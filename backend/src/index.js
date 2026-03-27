import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload.js';
import questionRoutes from './routes/questions.js';
import evaluateRoutes from './routes/evaluate.js';
import agentRoutes from './routes/agent.js';

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🚀 AI Resume Assistant is running!' });
});

// Routes
app.use('/api', uploadRoutes);
app.use('/api', questionRoutes);
app.use('/api', evaluateRoutes);
app.use('/api', agentRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
