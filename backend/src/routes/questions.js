import express from 'express';
import { questionChain } from '../chains/resumeChains.js';

const router = express.Router();

// POST /api/generate-questions
// Body: { resumeText: string }
router.post('/generate-questions', async (req, res, next) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Please provide a valid resume text (min 50 characters).' });
    }

    const questions = await questionChain.invoke({ resumeText });

    res.json({
      message: '✅ Questions generated!',
      questions
    });

  } catch (err) {
    next(err);
  }
});

export default router;
