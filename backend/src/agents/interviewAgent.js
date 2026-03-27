import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { generateQuestionsTool, evaluateAnswerTool, improveAnswerTool } from '../tools/interviewTools.js';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { retrieveRelevantChunks, hasVectorStore } from '../rag/vectorStore.js';
import dotenv from 'dotenv';

dotenv.config();

const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-flash-latest',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
});

const tools = [generateQuestionsTool, evaluateAnswerTool, improveAnswerTool];
const llmWithTools = llm.bindTools(tools);

// In-memory session store
const sessionHistories = {};

function getHistory(sessionId) {
  if (!sessionHistories[sessionId]) {
    sessionHistories[sessionId] = [];
  }
  return sessionHistories[sessionId];
}

function makeToolById(name) {
  return tools.find(t => t.name === name);
}

export async function runAgent({ userMessage, resumeText = '', sessionId = 'default' }) {
  const history = getHistory(sessionId);

  // ─── RAG: Retrieve relevant context instead of full resume ───
  let contextText = '';
  let ragUsed = false;

  if (hasVectorStore(sessionId)) {
    // Use RAG: retrieve only the most relevant chunks
    const relevantChunks = await retrieveRelevantChunks(sessionId, userMessage, 3);
    if (relevantChunks) {
      contextText = relevantChunks;
      ragUsed = true;
      console.log('🧠 Agent: Using RAG context (relevant chunks only)');
    }
  }

  // Fallback: use full resume text if RAG is not available
  if (!ragUsed) {
    contextText = resumeText ? resumeText.substring(0, 3000) : 'No resume uploaded yet.';
    console.log('📄 Agent: Using full resume text (no RAG)');
  }

  const systemMsg = new SystemMessage(`
You are an expert AI Interview Coach named "Ace". Your mission is to provide world-class interview preparation that feels professional, encouraging, and highly structured—exactly like a premium GPT interaction.

### Your Strategy:
1. **Be Structured**: Use Markdown headings (###), bold text (**bold**), and bullet points to make your advice easy to scan.
2. **Be Actionable**: Don't just give general advice. Give specific examples based on the candidate's resume.
3. **Be Conversational**: Start with a brief, friendly acknowledgment of the user's request. End with a "Pro Tip" or a logical next step.
4. **Standard Response Format**: 
   - Acknowledge & Small Talk
   - Detailed Content (using proper tools if needed)
   - Follow-up question to keep the momentum.

### Tools at your disposal:
- \`generate_questions\`: Use this when they want to practice.
- \`evaluate_answer\`: Use this when they provide an answer for feedback.
- \`improve_answer\`: Use this when they want a better version of their answer.

### Candidate Context${ragUsed ? ' (Retrieved via RAG - most relevant sections)' : ''}:
${contextText}

Remember: You are a coach, not just a generator. Guide them to success!
  `.trim());

  // Build message list
  const messages = [systemMsg, ...history, new HumanMessage(userMessage)];

  // Call LLM (may request tool calls)
  let response = await llmWithTools.invoke(messages);

  // Handle tool calls if LLM decided to use them
  while (response.tool_calls && response.tool_calls.length > 0) {
    const toolMessages = [];

    for (const toolCall of response.tool_calls) {
      const tool = makeToolById(toolCall.name);
      if (!tool) continue;

      const toolResult = await tool.invoke(toolCall.args);

      toolMessages.push({
        role: 'tool',
        content: toolResult,
        tool_call_id: toolCall.id
      });
    }

    // Continue conversation with tool results
    messages.push(response, ...toolMessages);
    response = await llmWithTools.invoke(messages);
  }

  const aiResponse = response.content;

  // Save to history
  history.push(new HumanMessage(userMessage));
  history.push(new AIMessage(aiResponse));

  // Limit history to last 10 turns to avoid token overflow
  if (history.length > 20) {
    sessionHistories[sessionId] = history.slice(-20);
  }

  return { response: aiResponse, sessionId, ragUsed };
}
