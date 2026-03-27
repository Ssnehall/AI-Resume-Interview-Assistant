import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import dotenv from 'dotenv';

dotenv.config();

export const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-flash-latest',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
});

// --------------------------------------------------
// Chain 1: Generate interview questions from resume
// --------------------------------------------------
const questionPrompt = PromptTemplate.fromTemplate(`
You are an expert technical interviewer. Based on the following resume, generate 8 targeted and high-quality interview questions.

### Guidelines for Questions:
- **Technical Focus**: Deep dive into the specific skills and frameworks mentioned.
- **Project Specific**: Ask about the implementation details of projects in the resume.
- **Behavioral**: Include 2-3 questions about soft skills, teamwork, and problem-solving.
- **Progression**: Range from fundamental concepts to advanced architectural discussions.

### Resume:
{resumeText}

### Response Format:
Provide a clear, numbered list with bold categories. For example:
**Technical Questions**
1. [Question]
...
**Behavioral Questions**
5. [Question]
...
**Challenge Questions** (Advanced)
8. [Question]
`);

export const questionChain = questionPrompt.pipe(llm).pipe(new StringOutputParser());

// --------------------------------------------------
// Chain 2: Evaluate a user's answer
// --------------------------------------------------
const evaluatePrompt = PromptTemplate.fromTemplate(`
You are a senior hiring manager. Evaluate the candidate's answer for the following question.

### Context:
- **Interview Question**: {question}
- **Candidate Answer**: {answer}
- **Resume Background**: {resumeText}

### Evaluation Structure:
1. **🏆 Overall Score**: [X/10] - A brief 1-sentence summary of the performance.
2. **✅ Strengths**: Bullet points highlighting what the candidate did well.
3. **⚠️ Areas for Improvement**: Specific feedback on what was missing or could be clarified.
4. **💡 Better Way to Say It**: A highly professional, structured (STAR method) model answer that the candidate should use.

Use professional and encouraging language. Format with clear Markdown headings.
`);

export const evaluateChain = evaluatePrompt.pipe(llm).pipe(new StringOutputParser());

// --------------------------------------------------
// Chain 3: Improve an answer
// --------------------------------------------------
const improvePrompt = PromptTemplate.fromTemplate(`
You are a professional career coach. Your task is to polish a candidate's answer to make it stand out.

### Inputs:
- **Question**: {question}
- **Original Answer**: {answer}
- **Resume Context**: {resumeText}

### Goal:
Rewrite the answer to be more impactful, using professional terminology and a clear logical flow (Situation, Task, Action, Result). 

### Final Polish:
- Keep it under 150 words.
- Use bolding for key achievements.
- Ensure the tone is confident and articulate.

Return the improved answer only, formatted for excellence.
`);

export const improveChain = improvePrompt.pipe(llm).pipe(new StringOutputParser());
