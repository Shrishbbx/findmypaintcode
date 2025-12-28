import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// OpenRouter client (uses OpenAI SDK format)
const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'FindMyPaintCode',
  },
});

export async function POST(request: NextRequest) {
  try {
    const { image, mimeType } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Use NVIDIA Nemotron model - excellent for OCR and visual analysis
    const completion = await openrouter.chat.completions.create({
      model: 'nvidia/nemotron-nano-12b-v2-vl:free',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: image, // Full data URL with base64
              },
            },
            {
              type: 'text',
              text: `You are a helpful automotive paint expert. Analyze this car photo carefully.

Your job is to identify the vehicle and color to help the user find their paint code.

Provide:
- **Make**: The car brand (Toyota, Honda, Ford, etc.)
- **Model**: The specific model name
- **Year Range**: Your best estimate based on the design
- **Color Description**: Detailed color description (e.g., "metallic dark blue", "pearl white", "solid red")
- **Possible Paint Codes**: Based on your automotive knowledge, suggest likely paint codes for this color on this vehicle
- **Confidence**: How confident are you? (high/medium/low)

Be helpful and specific. Use your knowledge of common paint colors for this make/model.

Respond in JSON format:
{
  "make": "string",
  "model": "string",
  "yearRange": "string",
  "colorDescription": "string",
  "possiblePaintCodes": ["string"],
  "confidence": "high|medium|low",
  "additionalInfo": "string"
}`,
            },
          ],
        },
      ],
      // TODO: Uncomment when using paid models (GPT-4, Claude, Gemini)
      // response_format: { type: 'json_object' },
    });

    const text = completion.choices[0]?.message?.content || '';

    // Try to parse JSON from response
    let parsedResponse;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        parsedResponse = { raw: text };
      }
    } catch {
      parsedResponse = { raw: text };
    }

    return NextResponse.json({
      success: true,
      analysis: parsedResponse,
      rawResponse: text
    });

  } catch (error) {
    console.error('OpenRouter API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image', details: String(error) },
      { status: 500 }
    );
  }
}
