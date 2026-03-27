import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { questionChain, evaluateChain, improveChain } from '../chains/resumeChains.js';

// Tool 1: Generate interview questions
export const generateQuestionsTool = new DynamicStructuredTool({
  name: 'generate_questions',
  description: 'Generate targeted interview questions based on a resume. Use when the user asks for interview questions.',
  schema: z.object({
    resumeText: z.string().describe('The full text of the resume')
  }),
  func: async ({ resumeText }) => {
    return await questionChain.invoke({ resumeText });
  }
});

// Tool 2: Evaluate an answer
export const evaluateAnswerTool = new DynamicStructuredTool({
  name: 'evaluate_answer',
  description: 'Evaluate a candidate answer to an interview question. Returns score, strengths, weaknesses, model answer.',
  schema: z.object({
    question: z.string().describe('The interview question'),
    answer: z.string().describe("The candidate's answer"),
    resumeText: z.string().describe('Resume text for context').optional().default('')
  }),
  func: async ({ question, answer, resumeText }) => {
    return await evaluateChain.invoke({ question, answer, resumeText });
  }
});

// Tool 3: Improve an answer
export const improveAnswerTool = new DynamicStructuredTool({
  name: 'improve_answer',
  description: 'Rewrite and improve a candidate answer to sound more professional and structured.',
  schema: z.object({
    question: z.string().describe('The interview question'),
    answer: z.string().describe("The candidate's original answer"),
    resumeText: z.string().describe('Resume context').optional().default('')
  }),
  func: async ({ question, answer, resumeText }) => {
    return await improveChain.invoke({ question, answer, resumeText });
  }
});
