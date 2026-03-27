import express from 'express';
import fs from 'fs';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// POST /api/upload - Upload a PDF resume and return extracted text
router.post('/upload', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a PDF.' });
    }

    // Read the uploaded file as buffer
    const fileBuffer = fs.readFileSync(req.file.path);

    // Extract text from PDF
    const pdfData = await pdfParse(fileBuffer);
    const resumeText = pdfData.text.trim();

    if (!resumeText) {
      return res.status(400).json({ error: 'Could not extract text from the PDF. Try a different file.' });
    }

    res.json({
      message: '✅ Resume uploaded and parsed successfully!',
      filename: req.file.filename,
      textLength: resumeText.length,
      resumeText
    });

  } catch (err) {
    next(err);
  }
});

export default router;
