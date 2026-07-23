const { GoogleGenAI, Type } = require('@google/genai');

// Lazily instantiate so the server can still boot without a key set (AI routes will just error gracefully)
let client = null;
const getClient = () => {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
};

const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

// NOTE: We deliberately do NOT set a thinkingConfig here. Gemini 2.5 models use a
// numeric "thinkingBudget" while Gemini 3.x models use a string "thinkingLevel" —
// these two are incompatible, and sending the wrong one causes a 400 INVALID_ARGUMENT.
// Since "gemini-flash-latest" is an alias that can silently point at either generation
// over time, we avoid the parameter entirely and just give a generous maxOutputTokens
// so there's always room left over for the actual answer after any invisible "thinking".

// Pulls the plain text out of a Gemini response, throwing a clear error instead of
// crashing with "Cannot read properties of undefined" if the model returned nothing
// (e.g. blocked by safety filters, or ran out of tokens).
const extractText = (response) => {
  const text = response?.text;
  if (!text) {
    const reason = response?.candidates?.[0]?.finishReason || 'unknown reason';
    throw new Error(`Gemini returned no text (finishReason: ${reason}). Try again or check your API key/quota.`);
  }
  return text.trim();
};

/**
 * Feature 1: AI Note Summarizer
 * Condenses raw customer notes into a concise, business-friendly summary.
 */
const generateSummary = async (notesText) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Customer notes:\n"""${notesText}"""\n\nSummary:`,
    config: {
      systemInstruction:
        'You are a CRM assistant. Summarize customer notes into 1-3 concise, professional sentences highlighting intent, interests, and concerns. Do not add information that is not present in the notes.',
      temperature: 0.3,
      maxOutputTokens: 1024,
    },
  });
  return extractText(response);
};

/**
 * Feature 2: AI Follow-Up Recommendation
 * Suggests the single best next action a sales/support rep should take.
 */
const generateFollowUp = async (notesText, status) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Customer status: ${status}\nCustomer notes:\n"""${notesText}"""\n\nRecommendation:`,
    config: {
      systemInstruction:
        'You are a CRM sales assistant. Based on the customer notes and their account status, recommend ONE clear, professional next action for the sales/support rep to take. Format as "Recommended Action: ...". Keep it under 40 words.',
      temperature: 0.4,
      maxOutputTokens: 1024,
    },
  });
  return extractText(response);
};

/**
 * Feature 3: AI Sentiment Analysis
 * Classifies customer sentiment as Positive / Neutral / Negative with a confidence score.
 * We ask Gemini to return structured JSON (via responseSchema) so the frontend can
 * render a badge + score reliably, without needing to hand-parse free text.
 */
const analyzeSentiment = async (notesText) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Customer notes:\n"""${notesText}"""`,
    config: {
      systemInstruction:
        'You are a sentiment classification engine for CRM notes. Analyze the sentiment of the given customer notes.',
      temperature: 0.1,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative'] },
          confidence: { type: Type.INTEGER },
        },
        required: ['label', 'confidence'],
      },
    },
  });

  try {
    const parsed = JSON.parse(extractText(response));
    return {
      label: parsed.label,
      confidence: Number(parsed.confidence),
    };
  } catch (err) {
    // Fallback if the model doesn't return clean JSON
    return { label: 'Neutral', confidence: 50 };
  }
};

module.exports = { generateSummary, generateFollowUp, analyzeSentiment };