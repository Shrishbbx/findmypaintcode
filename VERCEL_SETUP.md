# Vercel Deployment Setup

## Required Environment Variables

Add these environment variables in your Vercel project settings:

### 1. OpenAI API Key (Required for Facts & History)
```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Why it's needed:**
- Powers the "Facts & History" section on paint code result pages
- Generates interesting vehicle and color heritage information

**Where to get it:**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy and paste into Vercel environment variables

**Without this:**
- Facts & History section will show "Temporarily Unavailable" message
- Other features will work normally

### 2. Gemini API Key (Required for AI Image Analysis)
```
GEMINI_API_KEY=your-gemini-api-key-here
```

**Why it's needed:**
- Powers AI vehicle photo analysis in the chatbot
- Analyzes VIN tag photos to extract paint codes

**Where to get it:**
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy and paste into Vercel environment variables

## How to Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar
4. Add each variable:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Your API key
   - **Environments**: Check Production, Preview, and Development
5. Click **Save**
6. **Redeploy** your project for changes to take effect

## Troubleshooting

### Video not appearing on paint code pages?
- Check Vercel build logs for CSV loading errors
- Look for `[VIDEO]` prefixed log messages
- Verify `paint-code-videos.csv` is in the repository root

### Facts & History not showing?
- Check if `OPENAI_API_KEY` is set in Vercel environment variables
- Check Vercel function logs for API errors
- Verify you have OpenAI API credits available

### After adding environment variables:
1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Select **Redeploy**
4. Test the features after redeployment completes
