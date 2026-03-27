import express from 'express';
import { evaluateChain, improveChain } from '../chains/resumeChains.js';

const router = express.Router();

// POST /api/evaluate-answer
// Body: { question, answer, resumeText }
router.post('/evaluate-answer', async (req, res, next) => {
  try {
    const { question, answer, resumeText = '' } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Please provide both a question and an answer.' });
    }

    const feedback = await evaluateChain.invoke({ question, answer, resumeText });

    res.json({
      message: '✅ Answer evaluated!',
      feedback
    });

  } catch (err) {
    next(err);
  }
});

// POST /api/improve-answer
// Body: { question, answer, resumeText }
router.post('/improve-answer', async (req, res, next) => {
  try {
    const { question, answer, resumeText = '' } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Please provide both a question and an answer.' });
    }

    const improved = await improveChain.invoke({ question, answer, resumeText });

    res.json({
      message: '✅ Improved answer generated!',
      improved
    });

  } catch (err) {
    next(err);
  }
});

export default router;
