import express from 'express';
import { runAgent } from '../agents/interviewAgent.js';

const router = express.Router();

// POST /api/chat
// Body: { message, resumeText, sessionId }
router.post('/chat', async (req, res, next) => {
  try {
    const { message, resumeText = '', sessionId = 'default' } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a message.' });
    }

    const result = await runAgent({
      userMessage: message,
      resumeText,
      sessionId
    });

    res.json({
      message: '✅ Agent responded!',
      response: result.response,
      sessionId: result.sessionId
    });

  } catch (err) {
    next(err);
  }
});

export default router;
