# 🔐 Quick Security Setup Guide

## Step 1: Add Your OpenAI API Key

1. Open `.env.local` file
2. Replace `your_openai_api_key_here` with your actual OpenAI API key:
   ```
   OPENAI_API_KEY=sk-proj-...your-actual-key-here...
   ```
3. **NEVER commit this file to git** (it's already in `.gitignore`)

## Step 2: Set OpenAI Spending Limits

1. Go to https://platform.openai.com/settings/organization/limits
2. Set a **monthly spending limit** (recommended: $10-50/month)
3. Enable **email notifications** for usage alerts
4. Set up **usage thresholds** (e.g., alert at 50%, 80%, 100%)

## Step 3: Test the Setup

Start your dev server:
```bash
npm run dev
```

Visit http://localhost:3000 and try:
- Sending a chat message
- Uploading a car photo

## Step 4: Monitor Your Usage

- Check usage: https://platform.openai.com/usage
- Review costs daily for the first week
- Expected cost: **$1-5 per day** with moderate usage

## 🛡️ Security Features Active

✅ **Rate Limiting**: 10 chat requests/min, 5 images/min per IP
✅ **Input Validation**: Blocks malicious prompts and oversized inputs
✅ **Cost Controls**: Max 500 tokens/response, 30s timeout
✅ **Secure Headers**: XSS, clickjacking, MIME sniffing protection
✅ **API Key Protection**: Never exposed to client, stored in secure env vars

## 📊 What You're Protected Against

- ❌ Prompt injection / Jailbreak attempts
- ❌ DDoS and spam attacks
- ❌ Excessive token usage / Cost overruns
- ❌ Malicious file uploads
- ❌ API key theft/exposure
- ❌ System prompt extraction

## 🚨 Emergency Procedures

**If API key exposed:**
1. Revoke immediately: https://platform.openai.com/api-keys
2. Generate new key
3. Update `.env.local`

**If unexpected costs:**
1. Check usage dashboard
2. Temporarily disable API routes (comment out in code)
3. Review logs for attack patterns

## 📚 Full Documentation

See `SECURITY.md` for complete security documentation.

---

**Your API is now secure! 🎉**
