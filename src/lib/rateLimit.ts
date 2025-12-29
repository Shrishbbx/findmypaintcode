/**
 * Rate Limiting Middleware
 * Prevents API abuse by limiting requests per IP address
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

/**
 * Rate limiter to prevent API abuse
 * @param uniqueId - Unique identifier (e.g., IP address)
 * @param config - Rate limit configuration
 * @returns Object with limited status and remaining requests
 */
export function rateLimit(
  uniqueId: string,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 requests per minute
  }
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const store = rateLimitMap.get(uniqueId);

  if (!store || now > store.resetTime) {
    // Create new entry or reset
    rateLimitMap.set(uniqueId, {
      count: 1,
      resetTime: now + config.interval,
    });
    return {
      success: true,
      remaining: config.uniqueTokenPerInterval - 1,
      resetTime: now + config.interval,
    };
  }

  if (store.count >= config.uniqueTokenPerInterval) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: store.resetTime,
    };
  }

  // Increment counter
  store.count++;
  return {
    success: true,
    remaining: config.uniqueTokenPerInterval - store.count,
    resetTime: store.resetTime,
  };
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
  // Check various headers for IP (in order of priority)
  const headers = request.headers;

  return (
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('cf-connecting-ip') || // Cloudflare
    'unknown'
  );
}
