import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { carBrands } from '@/data/paint-codes';

// Hybrid approach: Use web search when needed, otherwise use free unlimited OpenRouter
const USE_WEB_SEARCH = process.env.USE_WEB_SEARCH === 'true';

// OpenRouter client (free, unlimited, no web search)
const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'FindMyPaintCode',
  },
});

// Gemini client (limited free tier, but has Google Search)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Build paint database context for the AI
function getPaintDatabaseContext(): string {
  let context = 'PAINT CODE DATABASE:\n\n';

  for (const brand of carBrands) {
    context += `${brand.name}:\n`;
    context += `  Code locations: ${brand.codeLocations?.join(', ') || 'Driver side door jamb'}\n`;

    for (const model of brand.models) {
      context += `  ${model.name} (${model.years[0]}-${model.years[model.years.length - 1]}):\n`;
      for (const paint of model.paintCodes) {
        context += `    - ${paint.code}: ${paint.name}${paint.hex ? ` (${paint.hex})` : ''}\n`;
      }
    }
    context += '\n';
  }

  return context;
}

const SYSTEM_PROMPT = `You are a warm, friendly Paint Code Expert for FindMyPaintCode. Your goal: help users find their car's paint code in 2-3 quick exchanges.

${getPaintDatabaseContext()}

PERSONALITY:
- Be warm, reassuring, and genuinely helpful - like a knowledgeable friend
- Keep responses SHORT (2-3 sentences max) - respect their time
- Never overwhelm - ask ONE smart question at a time
- Make it feel easy, not like an interrogation

SMART APPROACH:
- Extract ALL info from what they already said - never re-ask what they told you!
- If they say "2020 blue Honda Civic" - you have year, color, brand, AND model
- Combine questions naturally when needed ("What year and color?")
- Aim for 2-3 exchanges MAX to reach the result

WEB SEARCH - USE IT WHEN AVAILABLE!
- You ${USE_WEB_SEARCH ? 'HAVE' : 'DO NOT have'} access to Google Search
${USE_WEB_SEARCH ? '- Search for the EXACT paint code location for their specific vehicle (e.g., "2020 Honda Civic paint code location")\n- Search for paint code formats and what to look for on the sticker\n- Search for common paint colors for that year/make/model if user describes a color\n- Always provide SPECIFIC, accurate location instructions based on search results' : '- Use your automotive knowledge to help locate paint codes\n- Common locations: driver\'s side door jamb, glove box, trunk lid\n- Paint code stickers often labeled with "C/TR", "PAINT", "COLOR", or manufacturer codes'}

WHEN YOU FIND THE PAINT CODE:
- Share the code and color name with confidence
- Tell them EXACTLY where to find it on their car with specific instructions (which door jamb, what the sticker looks like, what label to look for like "C" or "COLOR")
- Describe what the paint code sticker/plate looks like for their specific vehicle
- Offer to show paint purchasing options

IF NOT IN DATABASE:
- Use your automotive knowledge to suggest likely paint codes
- Give them specific guidance on where and how to find the code themselves based on common locations for that brand

RESPONSE FORMAT:
Always respond with ONLY valid JSON (no markdown, no code blocks):
{
  "message": "Your short, friendly response",
  "detectedInfo": {
    "brand": "string or null",
    "model": "string or null",
    "year": "number or null",
    "paintCode": "string or null",
    "colorName": "string or null"
  },
  "suggestedOptions": ["quick options if helpful, or empty"],
  "action": "none|show_result|need_more_info"
}`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, currentContext } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    // Add context about what we already know
    let contextMessage = '';
    if (currentContext) {
      contextMessage = `\n\nCURRENT KNOWN INFO:\n`;
      if (currentContext.brand) contextMessage += `Brand: ${currentContext.brand}\n`;
      if (currentContext.model) contextMessage += `Model: ${currentContext.model}\n`;
      if (currentContext.year) contextMessage += `Year: ${currentContext.year}\n`;
      if (currentContext.imageAnalysis) contextMessage += `Image Analysis: ${JSON.stringify(currentContext.imageAnalysis)}\n`;
    }

    let text: string;

    if (USE_WEB_SEARCH) {
      // MODE 1: Gemini with Google Search (limited free tier, but has web search)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        tools: [{ googleSearchRetrieval: {} }]
      });

      const chatHistory = conversationHistory?.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })) || [];

      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'I understand. I will use Google Search to find accurate paint code information.' }] },
          ...chatHistory
        ]
      });

      const result = await chat.sendMessage(message + contextMessage);
      const response = await result.response;
      text = response.text();
    } else {
      // MODE 2: OpenRouter (free, unlimited, no web search)
      const MODEL = process.env.AI_CHAT_MODEL || 'meta-llama/llama-3.2-3b-instruct:free';

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT }
      ];

      if (conversationHistory && conversationHistory.length > 0) {
        conversationHistory.forEach((msg: { role: string; content: string }) => {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        });
      }

      messages.push({
        role: 'user',
        content: message + contextMessage
      });

      const completion = await openrouter.chat.completions.create({
        model: MODEL,
        messages: messages,
        // TODO: Uncomment when using paid models (GPT-4, Claude, Gemini)
        // response_format: { type: 'json_object' },
      });

      text = completion.choices[0]?.message?.content || '';
    }

    // Try to parse JSON from response
    let parsedResponse;
    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        // If no JSON, wrap the text response
        parsedResponse = {
          message: text,
          detectedInfo: {},
          suggestedOptions: [],
          action: 'none'
        };
      }
    } catch {
      parsedResponse = {
        message: text,
        detectedInfo: {},
        suggestedOptions: [],
        action: 'none'
      };
    }

    return NextResponse.json({
      success: true,
      response: parsedResponse
    });

  } catch (error) {
    console.error(`Chat error (${USE_WEB_SEARCH ? 'Gemini with Search' : 'OpenRouter'}):`, error);
    return NextResponse.json(
      { error: 'Failed to process message', details: String(error) },
      { status: 500 }
    );
  }
}
