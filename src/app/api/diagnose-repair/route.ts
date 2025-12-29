import OpenAI from 'openai';
import { NextRequest, NextResponse} from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { SECURITY_HEADERS } from '@/lib/security';
import type { DiagnoseRepairResponse } from '@/types';

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Rate limiting (10 requests per minute - lightweight operation)
const RATE_LIMIT = {
  interval: 60 * 1000,
  uniqueTokenPerInterval: 10,
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(clientIp, RATE_LIMIT);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many diagnosis requests. Please wait.',
        } as DiagnoseRepairResponse,
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    // Parse request
    const body = await request.json();
    const { problem, vehicle } = body;

    if (!problem || typeof problem !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Problem description is required',
        } as DiagnoseRepairResponse,
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    console.log('[DIAGNOSE-REPAIR] Analyzing problem:', problem, '| Vehicle:', vehicle);

    // Use AI to classify the repair problem and recommend product
    const diagnosisPrompt = `You are an automotive paint repair expert. Analyze this customer's paint problem and recommend the appropriate ERA Paints product.

Vehicle: ${vehicle || 'Not specified'}
Problem Description: "${problem}"

Classify the problem and recommend a product type:

REPAIR TYPES:
- "chip": Small paint chips (stone chips, door dings)
- "scratch": Linear scratches (key scratches, parking lot scratches)
- "large-area": Larger damaged areas (panels, fenders, bumpers)
- "rust": Rust spots or corrosion
- "touchup": General touch-up or minor imperfections

PRODUCT RECOMMENDATIONS:
- "touch-up-pen": Best for small chips and tiny scratches (very precise application)
- "spray-can": Best for larger areas, panels, or when blending is needed
- "complete-kit": Best for comprehensive repairs (includes primer, paint, clear coat)

Consider:
- Size of damage (small chip vs large panel)
- Type of damage (chip, scratch, area)
- User's skill level (pens are easiest, spray cans require more skill)
- Whether primer/clear coat is needed

Respond in JSON format:
{
  "repairType": "chip|scratch|large-area|rust|touchup",
  "recommendedProduct": "touch-up-pen|spray-can|complete-kit",
  "productName": "string (friendly name like 'Touch-Up Pen', 'Aerosol Spray Can', 'Complete Repair Kit')",
  "confidence": number (0.0 to 1.0),
  "reasoning": "string (brief explanation of why you recommended this product)"
}`;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert automotive paint repair advisor who helps customers choose the right products for their specific repair needs.',
        },
        {
          role: 'user',
          content: diagnosisPrompt,
        },
      ],
      max_tokens: 400,
      temperature: 0.3, // Low temperature for consistent recommendations
      response_format: { type: 'json_object' },
    });

    const diagnosisText = aiResponse.choices[0]?.message?.content || '{}';

    let diagnosis;
    try {
      diagnosis = JSON.parse(diagnosisText);
    } catch {
      console.error('[DIAGNOSE-REPAIR] Failed to parse AI diagnosis');
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to process repair diagnosis',
        } as DiagnoseRepairResponse,
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    // Validate the diagnosis
    const validRepairTypes = ['chip', 'scratch', 'large-area', 'rust', 'touchup'];
    const validProducts = ['touch-up-pen', 'spray-can', 'complete-kit'];

    if (!validRepairTypes.includes(diagnosis.repairType) ||
        !validProducts.includes(diagnosis.recommendedProduct)) {
      console.error('[DIAGNOSE-REPAIR] Invalid diagnosis values:', diagnosis);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid diagnosis result',
        } as DiagnoseRepairResponse,
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    console.log('[DIAGNOSE-REPAIR] Recommended:', {
      repairType: diagnosis.repairType,
      product: diagnosis.recommendedProduct,
      confidence: diagnosis.confidence,
    });

    return NextResponse.json(
      {
        success: true,
        diagnosis: {
          problem: problem,
          repairType: diagnosis.repairType,
          recommendedProduct: diagnosis.recommendedProduct,
          productName: diagnosis.productName,
          confidence: diagnosis.confidence,
        },
      } as DiagnoseRepairResponse,
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[DIAGNOSE-REPAIR] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to diagnose repair problem',
      } as DiagnoseRepairResponse,
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
