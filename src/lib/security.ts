/**
 * Security Utilities
 * Input validation, sanitization, and security checks
 */

const MAX_MESSAGE_LENGTH = 2000; // Prevent extremely long messages
const MAX_CONVERSATION_HISTORY = 20; // Limit conversation history to prevent token abuse
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB max image size

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    sanitized = sanitized.substring(0, MAX_MESSAGE_LENGTH);
  }

  return sanitized;
}

/**
 * Validate message input
 */
export function validateMessage(message: unknown): string {
  if (!message || typeof message !== 'string') {
    throw new Error('Message is required and must be a string');
  }

  const sanitized = sanitizeInput(message);

  if (sanitized.length === 0) {
    throw new Error('Message cannot be empty');
  }

  if (sanitized.length < 1) {
    throw new Error('Message is too short');
  }

  return sanitized;
}

/**
 * Validate conversation history
 */
export function validateConversationHistory(
  history: unknown
): Array<{ role: string; content: string }> {
  if (!history) {
    return [];
  }

  if (!Array.isArray(history)) {
    throw new Error('Conversation history must be an array');
  }

  // Limit history length to prevent token abuse
  const limitedHistory = history.slice(-MAX_CONVERSATION_HISTORY);

  return limitedHistory.map((msg, index) => {
    if (!msg || typeof msg !== 'object') {
      throw new Error(`Invalid message at index ${index}`);
    }

    const { role, content } = msg as { role: unknown; content: unknown };

    if (role !== 'user' && role !== 'assistant') {
      throw new Error(`Invalid role at index ${index}: ${role}`);
    }

    if (typeof content !== 'string') {
      throw new Error(`Invalid content at index ${index}`);
    }

    return {
      role: role as string,
      content: sanitizeInput(content),
    };
  });
}

/**
 * Validate image data URL
 */
export function validateImageDataUrl(imageDataUrl: unknown): string {
  if (!imageDataUrl || typeof imageDataUrl !== 'string') {
    throw new Error('Image data is required and must be a string');
  }

  // Check if it's a valid data URL
  if (!imageDataUrl.startsWith('data:image/')) {
    throw new Error('Invalid image data URL format');
  }

  // Estimate size (base64 encoded)
  const base64Data = imageDataUrl.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid image data URL');
  }

  const sizeInBytes = (base64Data.length * 3) / 4;
  if (sizeInBytes > MAX_IMAGE_SIZE) {
    throw new Error('Image size exceeds maximum allowed (5MB)');
  }

  // Validate MIME type
  const mimeTypeMatch = imageDataUrl.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,/);
  if (!mimeTypeMatch) {
    throw new Error('Invalid image format. Only JPEG, PNG, WebP, and GIF are allowed');
  }

  return imageDataUrl;
}

/**
 * Detect potentially malicious prompts
 */
export function detectMaliciousPrompt(message: string): boolean {
  const maliciousPatterns = [
    // Prompt injection attempts
    /ignore\s+(previous|all|above)\s+(instructions|prompts|rules)/i,
    /forget\s+(everything|all)\s+(you|that)/i,
    /you\s+are\s+now/i,
    /new\s+instructions/i,
    /system\s*:/i,
    /\[SYSTEM\]/i,
    /\<\|im_start\|\>/i,
    /\<\|im_end\|\>/i,

    // Attempts to extract system prompts
    /show\s+me\s+(your|the)\s+(system\s+)?(prompt|instructions)/i,
    /what\s+(are\s+)?(your|the)\s+(system\s+)?(prompt|instructions)/i,
    /reveal\s+(your|the)\s+prompt/i,

    // Jailbreak attempts
    /jailbreak/i,
    /DAN\s+mode/i,
    /developer\s+mode/i,
  ];

  return maliciousPatterns.some(pattern => pattern.test(message));
}

/**
 * Security headers for API responses
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
