import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { carBrands } from '@/data/paint-codes';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import {
  validateMessage,
  validateConversationHistory,
  detectMaliciousPrompt,
  SECURITY_HEADERS,
} from '@/lib/security';

// SECURITY: OpenAI client with paid API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// SECURITY: Usage limits to prevent cost overruns
const MAX_TOKENS = 500; // Limit response length
const TIMEOUT_MS = 30000; // 30 second timeout
const MODEL = 'gpt-4o-mini'; // Cost-effective model (2024)

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

const SYSTEM_PROMPT = `You are a warm, friendly Paint Code Expert for FindMyPaintCode. Your goal: systematically help users find their car's paint code and diagnose their repair needs.

${getPaintDatabaseContext()}

PERSONALITY:
- Be warm, reassuring, and genuinely helpful - like a knowledgeable friend
- Keep responses SHORT (2-3 sentences max) - respect their time
- Never overwhelm - ask ONE smart question at a time
- Make it feel easy, not like an interrogation

CONVERSATION STAGES (you receive currentStage to know where we are):
1. WELCOME: User picks how to start (car photo, VIN tag, or text description)
2. GATHERING_INFO: Extract/ask for brand, model, year, color/paintCode
3. VERIFYING_COLOR: Confirm the paint code/color with user
4. DIAGNOSING_PROBLEM: Ask what they're fixing (REQUIRED before result)
5. READY_FOR_RESULT: All info collected, trigger research and result

SMART APPROACH:
- Extract ALL info from what they already said - never re-ask what they told you!
- If they say "2020 blue Honda Civic" - you have year, color, brand, AND model
- Combine questions naturally when needed ("What year and color?")
- If user uploaded VIN tag (imageType='vin' in context), TRUST that data completely

VIN TAG UPLOADS:
- If context shows imageType='vin', the paint code and vehicle info are HIGHLY RELIABLE
- Don't question VIN tag data - it came from the official sticker
- Move directly to repair problem diagnosis after VIN confirmation

COLOR VERIFICATION:
- After identifying paint code (from photo, text, or database), ask user to confirm
- If user seems uncertain, suggest: "If you're not sure about the color, you can upload a photo of your VIN tag instead for 100% accuracy."
- Set action: "offer_vin_upload" if user is confused

REPAIR PROBLEM DIAGNOSIS (CRITICAL):
- NEVER show result until you know their repair problem!
- After confirming vehicle and color, ask: "What problem are you fixing?"
- Extract their problem description into detectedInfo.repairProblem
- Set action: "diagnose_problem" when problem is described
- Common problems: chips, scratches, large area, rust, general touchup

RESPONSE FORMAT:
Always respond with ONLY valid JSON (no markdown, no code blocks):
{
  "message": "Your short, friendly response",
  "detectedInfo": {
    "brand": "string or null",
    "model": "string or null",
    "year": "number or null",
    "paintCode": "string or null",
    "colorName": "string or null",
    "hexColor": "string or null",
    "colorVerified": "boolean or null",
    "repairProblem": "string or null (user's description of what they're fixing)"
  },
  "suggestedOptions": ["quick options if helpful, or empty"],
  "action": "none|verify_color|offer_vin_upload|diagnose_problem|show_result",
  "stage": "gathering_info|verifying_color|diagnosing_problem|ready_for_result"
}

CRITICAL RULES:
1. NEVER set action to "show_result" until repairProblem is collected
2. When you have brand + model + year + paintCode, ask for repair problem NEXT
3. After repair problem is described, set action: "diagnose_problem"
4. The system will automatically research paint locations and ERA Paints content
5. Fill in hexColor using your knowledge (e.g., #FFFFFF for white, #1E4D6B for blue)
6. If user is uncertain about color, set action: "offer_vin_upload"

Example Flow:
User: "2020 Honda Civic blue"
Response: action: "verify_color", paintCode: "B-593M", stage: "verifying_color"
Message: "I found paint code B-593M (Aegean Blue Metallic). Is that correct?"

User: "Yes that's right"
Response: action: "diagnose_problem", stage: "diagnosing_problem"
Message: "Great! What problem are you fixing? Small chips, scratches, or a larger area?"

User: "Small door ding and chip"
Response: action: "diagnose_problem", repairProblem: "Small door ding and chip"
Message: "Perfect! Let me find everything you need..."
[System handles diagnosis → research → result]`;

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // SECURITY: Rate limiting (10 requests per minute per IP)
    const rateLimitResult = rateLimit(clientIp, {
      interval: 60 * 1000, // 1 minute
      uniqueTokenPerInterval: 10, // 10 requests/min
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please wait before sending another message.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...SECURITY_HEADERS,
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(rateLimitResult.resetTime / 1000)),
          },
        }
      );
    }

    // SECURITY: Validate request body size (prevent huge payloads)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 50000) {
      // 50KB max
      return NextResponse.json(
        { error: 'Request payload too large' },
        { status: 413, headers: SECURITY_HEADERS }
      );
    }

    const body = await request.json();
    const { message, conversationHistory, currentContext, currentStage } = body;

    // SECURITY: Validate and sanitize message
    let validatedMessage: string;
    try {
      validatedMessage = validateMessage(message);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid message' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // SECURITY: Detect malicious prompts (jailbreaks, prompt injection)
    if (detectMaliciousPrompt(validatedMessage)) {
      console.warn(`Blocked malicious prompt from ${clientIp}: ${validatedMessage.substring(0, 100)}`);
      return NextResponse.json(
        { error: 'Invalid request. Please ask legitimate questions about car paint codes.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // SECURITY: Validate conversation history
    let validatedHistory;
    try {
      validatedHistory = validateConversationHistory(conversationHistory);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid conversation history' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Add context about what we already know
    let contextMessage = '';
    if (currentContext || currentStage) {
      contextMessage = `\n\nCURRENT CONTEXT:\n`;

      if (currentStage) {
        contextMessage += `Stage: ${currentStage}\n`;
      }

      if (currentContext) {
        if (currentContext.brand) contextMessage += `Brand: ${currentContext.brand}\n`;
        if (currentContext.model) contextMessage += `Model: ${currentContext.model}\n`;
        if (currentContext.year) contextMessage += `Year: ${currentContext.year}\n`;
        if (currentContext.paintCode) contextMessage += `Paint Code: ${currentContext.paintCode}\n`;
        if (currentContext.colorName) contextMessage += `Color: ${currentContext.colorName}\n`;
        if (currentContext.imageType) contextMessage += `Image Type: ${currentContext.imageType}\n`;
        if (currentContext.colorVerified) contextMessage += `Color Verified: Yes\n`;
        if (currentContext.repairProblem) contextMessage += `Repair Problem: ${currentContext.repairProblem}\n`;
        if (currentContext.imageAnalysis) {
          contextMessage += `Image Analysis: ${JSON.stringify(currentContext.imageAnalysis)}\n`;
        }
      }
    }

    // Build messages array
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (validatedHistory.length > 0) {
      validatedHistory.forEach((msg) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      });
    }

    messages.push({
      role: 'user',
      content: validatedMessage + contextMessage,
    });

    // SECURITY: Call OpenAI with timeout and token limits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const completion = await openai.chat.completions.create(
        {
          model: MODEL,
          messages: messages,
          max_tokens: MAX_TOKENS, // SECURITY: Limit response length to control costs
          temperature: 0.7,
          response_format: { type: 'json_object' }, // Force JSON output
        },
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const text = completion.choices[0]?.message?.content || '';

      // Parse JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(text);
      } catch {
        // Fallback if JSON parsing fails
        parsedResponse = {
          message: text,
          detectedInfo: {},
          suggestedOptions: [],
          action: 'none',
        };
      }

      return NextResponse.json(
        {
          success: true,
          response: parsedResponse,
        },
        {
          headers: {
            ...SECURITY_HEADERS,
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(Math.floor(rateLimitResult.resetTime / 1000)),
          },
        }
      );
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if ((error as Error).name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 504, headers: SECURITY_HEADERS }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('Chat API error:', error);

    // SECURITY: Don't leak internal error details to client
    return NextResponse.json(
      {
        error: 'An error occurred processing your request. Please try again.',
      },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
