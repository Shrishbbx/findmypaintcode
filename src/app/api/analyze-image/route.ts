import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { image, mimeType } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a helpful automotive paint expert. Analyze this car photo carefully.

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
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: image.split(',')[1] // Remove data URL prefix
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

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
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image', details: String(error) },
      { status: 500 }
    );
  }
}
