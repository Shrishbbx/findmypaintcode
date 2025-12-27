import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { carBrands } from '@/data/paint-codes';

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

WEB SEARCH - USE IT!
- You have access to Google Search - USE IT to find accurate information
- Search for the EXACT paint code location for their specific vehicle (e.g., "2020 Honda Civic paint code location")
- Search for paint code formats and what to look for on the sticker
- Search for common paint colors for that year/make/model if user describes a color
- Always provide SPECIFIC, accurate location instructions based on search results

WHEN YOU FIND THE PAINT CODE:
- Share the code and color name with confidence
- Tell them EXACTLY where to find it on their car with specific instructions (which door jamb, what the sticker looks like, what label to look for like "C" or "COLOR")
- Describe what the paint code sticker/plate looks like for their specific vehicle
- Offer to show paint purchasing options

IF NOT IN DATABASE:
- Search the web for paint codes for that vehicle
- Use your automotive knowledge combined with search results
- Always be helpful - never just say "I don't know"
- Give them specific guidance on where and how to find the code themselves

RESPONSE FORMAT:
Always respond with JSON:
{
  "message": "Your short, friendly response with specific details from web search",
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

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: [{ googleSearchRetrieval: {} }]
    });

    // Build conversation for context
    const chatHistory = conversationHistory?.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) || [];

    // Add context about what we already know
    let contextMessage = '';
    if (currentContext) {
      contextMessage = `\n\nCURRENT KNOWN INFO:\n`;
      if (currentContext.brand) contextMessage += `Brand: ${currentContext.brand}\n`;
      if (currentContext.model) contextMessage += `Model: ${currentContext.model}\n`;
      if (currentContext.year) contextMessage += `Year: ${currentContext.year}\n`;
      if (currentContext.imageAnalysis) contextMessage += `Image Analysis: ${JSON.stringify(currentContext.imageAnalysis)}\n`;
    }

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I am a Paint Code Expert assistant. I will help users find their car paint codes by asking questions, analyzing their responses, and matching them to the paint database. I will respond in the JSON format specified.' }]
        },
        ...chatHistory
      ]
    });

    const result = await chat.sendMessage(message + contextMessage);
    const response = await result.response;
    const text = response.text();

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
    console.error('Gemini chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message', details: String(error) },
      { status: 500 }
    );
  }
}
