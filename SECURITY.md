# Security Documentation

This document outlines all security measures implemented to protect the OpenAI API key and prevent abuse/cost overruns.

## 🔐 API Key Protection

### Environment Variables
- **Location**: API keys are stored in `.env.local` (NEVER committed to git)
- **Git Protection**: `.env*` is in `.gitignore` to prevent accidental commits
- **Server-Side Only**: API keys are ONLY used in server-side API routes (`/api/*`)
- **Never Exposed**: API keys are NEVER sent to the client or included in client-side code

### Deployment Security
- For production (Netlify), set environment variables in the Netlify dashboard
- Never hardcode API keys in source code
- Rotate keys immediately if accidentally exposed

## 🛡️ Multi-Layer Security System

### 1. Rate Limiting (`src/lib/rateLimit.ts`)

**Purpose**: Prevent API abuse and DDoS attacks

**Implementation**:
- **Chat API**: 10 requests per minute per IP address
- **Image Analysis**: 5 requests per minute per IP (stricter - more expensive)
- IP-based tracking using client IP from headers
- Automatic cleanup of old rate limit data every 10 minutes
- Returns HTTP 429 with `Retry-After` header when exceeded

**Response Headers**:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1234567890
Retry-After: 42
```

### 2. Input Validation & Sanitization (`src/lib/security.ts`)

**Purpose**: Prevent injection attacks and malicious inputs

**Protections**:
- **Message Validation**:
  - Maximum length: 2,000 characters (prevents token abuse)
  - Removes null bytes and dangerous characters
  - Trims whitespace
  - Rejects empty or invalid messages

- **Conversation History**:
  - Limited to last 20 messages (prevents context stuffing)
  - Validates message structure and roles
  - Sanitizes all content

- **Image Validation**:
  - Maximum size: 5MB
  - Valid formats only: JPEG, PNG, WebP, GIF
  - Validates data URL format
  - Checks MIME type

### 3. Prompt Injection Detection

**Purpose**: Prevent jailbreaks and system prompt extraction

**Blocked Patterns**:
- "Ignore previous instructions"
- "You are now..."
- "Show me your system prompt"
- "Forget everything"
- "DAN mode" / "Developer mode"
- System-level tokens like `<|im_start|>` or `[SYSTEM]`

**Action**: Returns HTTP 400 and logs the attempt (includes IP for monitoring)

### 4. Cost Control Limits

**Purpose**: Prevent unexpected OpenAI billing

**Limits**:
```typescript
// Chat API
MAX_TOKENS: 500          // Maximum response length
TIMEOUT: 30 seconds      // Request timeout
MODEL: 'gpt-4o-mini'     // Cost-effective model

// Image Analysis API
MAX_TOKENS: 500          // Maximum response length
TIMEOUT: 60 seconds      // Longer timeout for vision
DETAIL: 'low'            // Low-detail images (cheaper)
MODEL: 'gpt-4o-mini'     // Supports vision, cost-effective
```

**Abort Controller**: Automatically cancels requests that exceed timeout

### 5. Request Size Validation

**Purpose**: Prevent payload attacks and excessive costs

**Limits**:
- Chat API: 50KB maximum request size
- Image API: 10MB maximum request size (for base64 images)
- Returns HTTP 413 (Payload Too Large) when exceeded

### 6. Security Headers

**Purpose**: Protect against common web vulnerabilities

**Headers Applied** (every API response):
```typescript
'X-Content-Type-Options': 'nosniff'           // Prevent MIME sniffing
'X-Frame-Options': 'DENY'                      // Prevent clickjacking
'X-XSS-Protection': '1; mode=block'            // XSS protection
'Referrer-Policy': 'strict-origin-when-cross-origin'
'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
```

### 7. Error Handling

**Purpose**: Prevent information leakage

**Implementation**:
- Generic error messages to clients ("An error occurred...")
- Detailed errors logged server-side only
- No stack traces or internal details exposed
- Specific error codes for debugging (400, 429, 413, 504, 500)

## 📊 Monitoring & Logging

### What's Logged:
- Malicious prompt attempts (with IP address)
- API errors (server-side only)
- Rate limit violations

### What's NOT Logged:
- API keys
- User messages (privacy)
- Personal information

## 🚨 Security Best Practices

### For Developers:

1. **Never commit `.env.local`**
   - Always check before committing: `git status`
   - API keys in git history = immediate rotation needed

2. **Monitor OpenAI Usage**
   - Set up billing alerts in OpenAI dashboard
   - Check usage regularly: https://platform.openai.com/usage
   - Set spending limits if available

3. **Rotate Keys Regularly**
   - Rotate API keys every 90 days
   - Immediately rotate if exposure suspected

4. **Review Security Logs**
   - Monitor console for blocked malicious prompts
   - Check for unusual rate limit patterns

### For Production Deployment:

1. **Set Environment Variables**
   ```bash
   # In Netlify dashboard, add:
   OPENAI_API_KEY=sk-...your-key
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

2. **Enable Additional Protections**
   - Use Netlify Edge Functions for extra rate limiting
   - Enable DDOS protection
   - Set up monitoring alerts

3. **Regular Security Audits**
   - Review API usage patterns
   - Check for unusual spikes
   - Update dependencies regularly

## 💰 Cost Estimation

### GPT-4o-mini Pricing (as of 2024):
- **Input**: ~$0.15 per 1M tokens
- **Output**: ~$0.60 per 1M tokens

### With Current Limits:
- Max 500 tokens per response
- 10 chat requests/min = ~600 requests/hour max
- Estimated cost: **$1-5 per day** with heavy usage
- Image analysis: ~$0.01 per image with low detail

### Budget Protection:
- Set monthly spending limit in OpenAI dashboard
- Enable email alerts for high usage
- Monitor daily usage via OpenAI dashboard

## 🔍 Testing Security

### Test Rate Limiting:
```bash
# Send 15 requests rapidly - should get 429 after 10th
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"test"}'
done
```

### Test Input Validation:
```bash
# Should reject: message too long (2000+ chars)
# Should reject: malicious prompt with "ignore previous instructions"
# Should reject: empty message
```

### Test Image Size Limit:
```bash
# Upload 10MB+ image - should get 413 error
```

## 📞 Security Incident Response

### If API Key is Exposed:

1. **IMMEDIATELY** revoke the key in OpenAI dashboard
2. Generate a new API key
3. Update `.env.local` and production environment variables
4. Check OpenAI usage dashboard for unauthorized usage
5. Contact OpenAI support if significant fraudulent usage occurred

### If Unusual Costs Detected:

1. Check OpenAI usage dashboard for spike
2. Review application logs for attack patterns
3. Temporarily disable API routes if needed
4. Investigate and patch vulnerability
5. Consider additional rate limiting

## 📚 Additional Resources

- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

---

**Last Updated**: 2024
**Security Review**: Required every 90 days
