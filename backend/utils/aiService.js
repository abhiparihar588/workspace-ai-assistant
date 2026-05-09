/**
 * utils/aiService.js
 * Google Gemini integration for work summaries and productivity reports
 */

const { GoogleGenAI } = require('@google/genai');

// Lazily initialize client (requires GEMINI_API_KEY in .env)
let client;
const getClient = () => {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
};

const MODEL = 'gemini-2.5-flash';

// ──────────────────────────────────────────────────────────
// Generate a professional summary for a single work log entry
// ──────────────────────────────────────────────────────────
exports.generateWorkSummary = async (workDescription, employeeName) => {
  const prompt = `You are a professional HR assistant. Transform the following raw work notes into a concise, polished 2-3 sentence professional summary. Highlight the impact and achievements.

Employee: ${employeeName}
Raw Work Notes: "${workDescription}"

Respond with ONLY the professional summary. No labels, no preamble.`;

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { maxOutputTokens: 300 }
  });

  const summary = response.text?.trim() || 'Summary unavailable.';
  
  // Map Gemini usage back to what the controller expects
  const usage = {
    input_tokens: response.usageMetadata?.promptTokenCount || 0,
    output_tokens: response.usageMetadata?.candidatesTokenCount || 0,
  };

  return { summary, usage };
};

// ──────────────────────────────────────────────────────────
// Generate a productivity report for multiple log entries
// ──────────────────────────────────────────────────────────
exports.generateProductivityReport = async (logs, employeeName) => {
  const logText = logs
    .map(l => `• ${new Date(l.date).toLocaleDateString()} | ${l.title} (${l.hours}h) — ${l.description}`)
    .join('\n');

  const totalHours = logs.reduce((s, l) => s + l.hours, 0);

  const prompt = `You are a productivity analyst generating a performance review.

Analyze the following work logs for ${employeeName} (${logs.length} entries, ${totalHours} total hours) and provide a structured report with:

1. **Overall Assessment** (2-3 sentences on general productivity and output quality)
2. **Key Strengths** (2-3 specific bullet points based on the work done)
3. **Areas for Growth** (1-2 constructive, specific suggestions)
4. **Recommended Focus** (1 actionable recommendation for next week)

Work Logs:
${logText}

Be specific, data-driven, constructive, and professional. Use the actual tasks mentioned.`;

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { maxOutputTokens: 600 }
  });

  const report = response.text?.trim() || 'Report unavailable.';
  
  const usage = {
    input_tokens: response.usageMetadata?.promptTokenCount || 0,
    output_tokens: response.usageMetadata?.candidatesTokenCount || 0,
  };

  return { report, usage };
};
