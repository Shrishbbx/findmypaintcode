'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChatMessage as ChatMessageType, ChatOption, DetectedInfo, ConversationStage } from '@/types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatOptions } from './ChatOptions';
import { ChatSidebar } from './ChatSidebar';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Enhanced Welcome message - Start with brand selection
const getWelcomeMessage = (): ChatMessageType => ({
  id: generateId(),
  type: 'bot',
  content: "Hi! I'm your Paint Code Expert. I'll help you find the exact paint code for your car.\n\nLet's start! What's your car brand?",
  timestamp: new Date(),
  options: [
    { label: 'Toyota', value: 'brand-toyota' },
    { label: 'Honda', value: 'brand-honda' },
    { label: 'Ford', value: 'brand-ford' },
    { label: 'Chevrolet', value: 'brand-chevrolet' },
    { label: 'BMW', value: 'brand-bmw' },
    { label: 'Mercedes', value: 'brand-mercedes' },
    { label: 'Nissan', value: 'brand-nissan' },
    { label: 'Acura', value: 'brand-acura' },
    { label: 'Other Brand', value: 'brand-other' },
    { label: '🤷 Not Sure', value: 'not-sure-brand' },
    { label: '📷 Upload Photo Instead', value: 'upload-photo-instead' },
  ],
});

interface ChatHistoryItem {
  id: string;
  preview: string;
  timestamp: Date;
  messages: ChatMessageType[];
  conversationHistory: ConversationMessage[];
  detectedInfo: DetectedInfo;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'findmypaintcode_chats';
const ANALYTICS_KEY = 'findmypaintcode_analytics';

// Load chats from sessionStorage (session-only, no quota issues)
const loadChats = (): ChatHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((chat: ChatHistoryItem) => ({
        ...chat,
        timestamp: new Date(chat.timestamp),
        messages: chat.messages.map((m: ChatMessageType) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      }));
    }
  } catch (e) {
    console.error('Failed to load chats:', e);
  }
  return [];
};

// Save chats to sessionStorage (clears when browser closes)
const saveChats = (chats: ChatHistoryItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    // Only keep last 5 chats to prevent quota issues
    const recentChats = chats.slice(-5);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(recentChats));
  } catch (e) {
    console.error('Failed to save chats:', e);
    // If still failing, clear old data and try again
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chats.slice(-3)));
    } catch (retryError) {
      console.error('Failed to save chats after cleanup:', retryError);
    }
  }
};

// Track success rate analytics (lightweight, persists across sessions)
const trackAnalytics = (success: boolean, paintCodeFound?: string) => {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    const analytics = stored ? JSON.parse(stored) : { total: 0, successful: 0, failed: 0 };

    analytics.total++;
    if (success) {
      analytics.successful++;
      analytics.lastSuccess = new Date().toISOString();
    } else {
      analytics.failed++;
    }

    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  } catch (e) {
    console.error('Failed to save analytics:', e);
  }
};

export function ChatContainer() {
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessageType[]>([getWelcomeMessage()]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [detectedInfo, setDetectedInfo] = useState<DetectedInfo>({});
  const [currentOptions, setCurrentOptions] = useState<ChatOption[]>([]);
  const [imageAnalysis, setImageAnalysis] = useState<unknown>(null);

  // NEW: Conversation stage tracking
  const [stage, setStage] = useState<ConversationStage>('welcome');
  const [waitingForImageType, setWaitingForImageType] = useState<'car' | 'vin' | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chats on mount and cleanup old localStorage data
  useEffect(() => {
    // Cleanup: Remove old localStorage chat data (moved to sessionStorage)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Failed to cleanup old localStorage:', e);
      }
    }

    const loaded = loadChats();
    setChatHistory(loaded);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save current chat to history
  const saveCurrentChat = useCallback(() => {
    if (!currentChatId || messages.length <= 1) return;

    const firstUserMessage = messages.find(m => m.type === 'user');
    const preview = firstUserMessage?.content.slice(0, 50) || 'New conversation';

    setChatHistory(prev => {
      const existingIndex = prev.findIndex(c => c.id === currentChatId);
      const updatedChat: ChatHistoryItem = {
        id: currentChatId,
        preview: preview + (preview.length >= 50 ? '...' : ''),
        timestamp: new Date(),
        messages,
        conversationHistory,
        detectedInfo,
      };

      let newHistory;
      if (existingIndex >= 0) {
        newHistory = [...prev];
        newHistory[existingIndex] = updatedChat;
      } else {
        newHistory = [updatedChat, ...prev];
      }

      saveChats(newHistory);
      return newHistory;
    });
  }, [currentChatId, messages, conversationHistory, detectedInfo]);

  // Save chat when messages change (debounced effect)
  useEffect(() => {
    if (currentChatId && messages.length > 1) {
      const timeout = setTimeout(saveCurrentChat, 500);
      return () => clearTimeout(timeout);
    }
  }, [messages, currentChatId, saveCurrentChat]);

  const addBotMessage = (content: string, options?: ChatOption[]) => {
    setMessages(prev => [
      ...prev,
      {
        id: generateId(),
        type: 'bot',
        content,
        timestamp: new Date(),
        options,
      },
    ]);
    if (options) {
      setCurrentOptions(options);
    } else {
      setCurrentOptions([]);
    }
  };

  const addUserMessage = (content: string, imageUrl?: string) => {
    // Create new chat if this is first user message
    if (!currentChatId) {
      setCurrentChatId(`chat-${generateId()}`);
    }

    setMessages(prev => [
      ...prev,
      {
        id: generateId(),
        type: 'user',
        content,
        timestamp: new Date(),
        imageUrl,
      },
    ]);
  };

  // Call chat API
  const sendToChat = async (message: string) => {
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory,
          currentContext: {
            ...detectedInfo,
            imageAnalysis,
          },
          currentStage: stage,
        }),
      });

      const data = await response.json();

      if (data.success && data.response) {
        const aiResponse = data.response;

        // Update conversation history
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: message },
          { role: 'assistant', content: aiResponse.message },
        ]);

        // Update detected info (including hexColor from AI)
        if (aiResponse.detectedInfo) {
          setDetectedInfo(prev => ({
            ...prev,
            ...Object.fromEntries(
              Object.entries(aiResponse.detectedInfo).filter(([, v]) => v !== null)
            ),
          }));
        }

        // Update stage if provided
        if (aiResponse.stage) {
          setStage(aiResponse.stage);
        }

        // Convert suggested options to ChatOptions
        const options: ChatOption[] = aiResponse.suggestedOptions?.map((opt: string) => ({
          label: opt,
          value: opt.toLowerCase().replace(/\s+/g, '-'),
        })) || [];

        addBotMessage(aiResponse.message, options.length > 0 ? options : undefined);

        // Handle actions based on AI response
        if (aiResponse.action === 'diagnose_problem' && aiResponse.detectedInfo?.repairProblem) {
          // User just described their problem - diagnose it
          setIsTyping(true);
          setStage('diagnosing_problem');

          try {
            const diagnosisResponse = await fetch('/api/diagnose-repair', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                problem: aiResponse.detectedInfo.repairProblem,
                vehicle: `${detectedInfo.brand} ${detectedInfo.model}`,
              }),
            });

            const diagnosisData = await diagnosisResponse.json();

            if (diagnosisData.success && diagnosisData.diagnosis) {
              setDetectedInfo(prev => ({
                ...prev,
                repairProblem: diagnosisData.diagnosis.problem,
                repairType: diagnosisData.diagnosis.repairType,
                recommendedProduct: diagnosisData.diagnosis.recommendedProduct,
              }));

              addBotMessage(`Perfect! For ${diagnosisData.diagnosis.repairType} repairs, I recommend a ${diagnosisData.diagnosis.productName}. Let me gather everything you need...`);

              // Trigger research sequence
              await researchPaintLocation();
              await researchEraContent();

              // Show result link with option to navigate (will skip if required fields missing)
              setTimeout(() => {
                showResultLink();
              }, 1000);
            }
          } catch (error) {
            console.error('[DIAGNOSIS] Error:', error);
            // Continue without diagnosis
          } finally {
            setIsTyping(false);
          }
        } else if (aiResponse.action === 'show_result' && aiResponse.detectedInfo?.paintCode) {
          // OLD FLOW: Direct result (kept for backward compatibility)
          const brand = aiResponse.detectedInfo.brand || detectedInfo.brand;
          const model = aiResponse.detectedInfo.model || detectedInfo.model;
          const year = aiResponse.detectedInfo.year || detectedInfo.year;
          const paintCode = aiResponse.detectedInfo.paintCode;

          // Check if we have repair problem - if not, ask for it
          if (!detectedInfo.repairProblem) {
            setStage('diagnosing_problem');
            addBotMessage(
              "Great! Before I show you the results, what problem are you fixing? This helps me recommend the right product.",
              [
                { label: 'Small chips/scratches', value: 'problem-chips' },
                { label: 'Larger damaged area', value: 'problem-large' },
                { label: 'Deep scratch', value: 'problem-deep' },
                { label: 'Just need touch-up', value: 'problem-touchup' },
              ]
            );
          } else {
            // We have everything - do research and show link
            await researchPaintLocation();
            await researchEraContent();

            // Show result link (will skip if required fields missing)
            setTimeout(() => {
              showResultLink();
            }, 1000);
          }
        }
      } else {
        addBotMessage("I'm sorry, I had trouble processing that. Could you try again?");
      }
    } catch (error) {
      console.error('Chat error:', error);
      addBotMessage("Sorry, there was an error connecting to the AI. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  // Analyze image with Gemini
  const analyzeImage = async (imageDataUrl: string) => {
    setIsTyping(true);
    addBotMessage("Analyzing your car photo... This may take a moment.");

    try {
      const mimeTypeMatch = imageDataUrl.match(/^data:([^;]+);/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageDataUrl,
          mimeType,
        }),
      });

      const data = await response.json();

      if (data.success && data.analysis) {
        const analysis = data.analysis;
        setImageAnalysis(analysis);

        if (analysis.make) {
          setDetectedInfo(prev => ({
            ...prev,
            brand: analysis.make,
            model: analysis.model,
          }));
        }

        let message = "Here's what I found from your photo:\n\n";

        if (analysis.make && analysis.model) {
          message += `**Vehicle:** ${analysis.make} ${analysis.model}`;
          if (analysis.yearRange) message += ` (${analysis.yearRange})`;
          message += '\n';
        }

        if (analysis.colorDescription) {
          message += `**Color:** ${analysis.colorDescription}\n`;
        }

        if (analysis.possiblePaintCodes?.length > 0) {
          message += `**Possible Paint Codes:** ${analysis.possiblePaintCodes.join(', ')}\n`;
        }

        message += `\n**Confidence:** ${analysis.confidence || 'medium'}\n\n`;

        message += "Does this look correct?";

        const options: ChatOption[] = [
          { label: '✅ Yes, that\'s correct', value: 'confirm-yes' },
          { label: '❌ No, try again', value: 'confirm-no' },
        ];

        addBotMessage(message, options);

        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: `[User uploaded a car photo]` },
          { role: 'assistant', content: message },
        ]);

      } else {
        addBotMessage(
          "I couldn't analyze the image clearly. Could you try uploading another photo with better lighting, or tell me about your car instead?",
          [
            { label: 'Describe my car', value: 'describe' },
            { label: 'Try another photo', value: 'retry-photo' },
          ]
        );
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      addBotMessage(
        "Sorry, I had trouble analyzing that image. You can try another photo or just tell me your car's make, model, and year.",
        [
          { label: 'Describe my car instead', value: 'describe' },
        ]
      );
    } finally {
      setIsTyping(false);
    }
  };

  // NEW: Handle VIN tag upload (separate from car photo)
  const analyzeVinTag = async (imageDataUrl: string) => {
    setIsTyping(true);
    addBotMessage("Reading your VIN tag... Extracting paint code information...");

    try {
      const mimeTypeMatch = imageDataUrl.match(/^data:([^;]+);/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

      const response = await fetch('/api/analyze-vin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageDataUrl,
          mimeType,
        }),
      });

      const data = await response.json();

      if (data.success && data.vinData) {
        const vinData = data.vinData;

        // Update detected info with VIN data
        setDetectedInfo(prev => ({
          ...prev,
          brand: vinData.brand || prev.brand,
          model: vinData.model || prev.model,
          year: vinData.year || prev.year,
          paintCode: vinData.paintCode || prev.paintCode,
          colorName: vinData.colorName || prev.colorName,
          hexColor: vinData.hexColor || prev.hexColor,
          vinNumber: vinData.vin,
          imageType: 'vin',
        }));

        let message = "Perfect! Here's what I found on your VIN tag:\n\n";

        if (vinData.vin) {
          message += `**VIN:** ${vinData.vin}\n`;
        }

        if (vinData.paintCode) {
          message += `**Paint Code:** ${vinData.paintCode}\n`;
        }

        if (vinData.colorName) {
          message += `**Color:** ${vinData.colorName}\n`;
        }

        if (vinData.brand && vinData.model && vinData.year) {
          message += `**Vehicle:** ${vinData.year} ${vinData.brand} ${vinData.model}\n`;
        }

        message += `\n**Confidence:** ${vinData.confidence}\n\n`;
        message += "Is this information correct?";

        const options: ChatOption[] = [
          { label: 'Yes, that\'s correct!', value: 'confirm-vin-yes' },
          { label: 'No, let me clarify', value: 'confirm-vin-no' },
        ];

        addBotMessage(message, options);
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: '[User uploaded VIN tag photo]' },
          { role: 'assistant', content: message },
        ]);

        setStage('verifying_color');
      } else {
        addBotMessage(
          "I had trouble reading the VIN tag clearly. Could you try:\n• Taking a closer photo with better lighting\n• Or just tell me your car's details instead?",
          [
            { label: 'Try another VIN photo', value: 'retry-vin' },
            { label: 'Describe my car instead', value: 'describe' },
          ]
        );
      }
    } catch (error) {
      console.error('VIN analysis error:', error);
      addBotMessage(
        "Sorry, I had trouble analyzing that VIN tag. You can try another photo or tell me your car details.",
        [{ label: 'Describe my car instead', value: 'describe' }]
      );
    } finally {
      setIsTyping(false);
      setWaitingForImageType(null);
    }
  };

  // NEW: Research paint code location
  const researchPaintLocation = async () => {
    const { brand, model, year } = detectedInfo;

    if (!brand || !model || !year) {
      console.warn('[RESEARCH] Missing vehicle info for paint location research');
      return;
    }

    setIsTyping(true);
    setStage('researching_location');
    addBotMessage("Let me research where to find the paint code on your specific vehicle...");

    try {
      const response = await fetch('/api/research-paint-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, model, year }),
      });

      const data = await response.json();

      if (data.success && data.locations) {
        setDetectedInfo(prev => ({
          ...prev,
          paintLocationResearch: {
            locations: data.locations,
            sources: data.sources || [],
            researched: true,
          },
        }));

        console.log('[RESEARCH] Paint location research complete:', data.locations.length, 'locations');
      } else {
        console.warn('[RESEARCH] Paint location research failed:', data.error);
        // Continue anyway - result page will show generic locations
      }
    } catch (error) {
      console.error('[RESEARCH] Paint location error:', error);
      // Continue anyway - not critical
    } finally {
      setIsTyping(false);
    }
  };

  // NEW: Research ERA Paints content
  const researchEraContent = async () => {
    const { brand, model, repairType, repairProblem } = detectedInfo;

    if (!brand || !model) {
      console.warn('[RESEARCH] Missing vehicle info for ERA content research');
      return;
    }

    setIsTyping(true);
    setStage('researching_era_content');
    addBotMessage("Finding the best ERA Paints resources for you...");

    try {
      const response = await fetch('/api/research-era-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, model, repairType, repairProblem }),
      });

      const data = await response.json();

      if (data.success) {
        setDetectedInfo(prev => ({
          ...prev,
          eraContent: {
            article: data.article,
            video: data.video,
            researched: true,
          },
        }));

        console.log('[RESEARCH] ERA content research complete');
      } else {
        console.warn('[RESEARCH] ERA content research failed:', data.error);
        // Continue anyway - result page will hide these sections
      }
    } catch (error) {
      console.error('[RESEARCH] ERA content error:', error);
      // Continue anyway - not critical
    } finally {
      setIsTyping(false);
    }
  };

  // Build result URL with all research data
  const buildResultUrl = () => {
    const { brand, model, year, paintCode, hexColor, repairType, recommendedProduct,
            paintLocationResearch, eraContent } = detectedInfo;

    if (!brand || !model || !year || !paintCode) {
      console.log('[NAV] Cannot build URL - missing required fields:', { brand, model, year, paintCode });
      return null;
    }

    const params = new URLSearchParams();

    if (hexColor) params.set('hex', hexColor);
    if (repairType) params.set('repairType', repairType);
    if (recommendedProduct) params.set('recommendedProduct', recommendedProduct);

    if (paintLocationResearch) {
      params.set('locations', JSON.stringify({
        locations: paintLocationResearch.locations,
        sources: paintLocationResearch.sources,
      }));
    }

    if (eraContent?.article) {
      params.set('eraArticle', JSON.stringify(eraContent.article));
    }

    if (eraContent?.video) {
      params.set('eraVideo', JSON.stringify(eraContent.video));
    }

    const url = `/paint-code/${brand.toLowerCase()}/${model.toLowerCase().replace(/\s+/g, '-')}/${year}/${paintCode.toLowerCase().replace(/\s+/g, '-')}?${params.toString()}`;

    console.log('[NAV] Built result URL:', url);
    return url;
  };

  // Show result link without auto-navigating
  const showResultLink = () => {
    const url = buildResultUrl();
    if (!url) return;

    const { brand, model, year, paintCode } = detectedInfo;

    addBotMessage(
      `Perfect! I've found everything you need for your **${year} ${brand} ${model}**.\n\n` +
      `Paint Code: **${paintCode}**\n\n` +
      `Your personalized result page includes:\n` +
      `✓ Exact paint code location on your vehicle\n` +
      `✓ ERA Paints product recommendations\n` +
      `✓ How-to repair guides & videos\n` +
      `✓ Direct purchase links\n\n` +
      `Ready to view your results?`,
      [
        { label: '🎨 View My Results', value: 'view-results' },
        { label: '🔄 Start Over', value: 'start-over' },
      ]
    );

    // Store URL for later navigation
    setDetectedInfo(prev => ({ ...prev, resultUrl: url }));
  };

  const handleTextSubmit = (text: string) => {
    addUserMessage(text);
    sendToChat(text);
  };

  const handleImageUpload = (imageUrl: string) => {
    // Check if we're waiting for a specific image type
    if (waitingForImageType === 'vin') {
      addUserMessage("Here's my VIN tag photo", imageUrl);
      analyzeVinTag(imageUrl);
    } else {
      // Default to car photo
      addUserMessage("Here's a photo of my car", imageUrl);
      setDetectedInfo(prev => ({ ...prev, imageType: 'car' }));
      analyzeImage(imageUrl);
    }
  };

  const handleOptionSelect = (option: ChatOption) => {
    addUserMessage(option.label);
    setCurrentOptions([]);

    // BRAND SELECTION
    if (option.value.startsWith('brand-')) {
      const brand = option.label; // "Toyota", "Honda", etc.
      setDetectedInfo(prev => ({ ...prev, brand }));
      setStage('gathering_info');

      if (option.value === 'brand-other') {
        addBotMessage("No problem! Please tell me your car's brand (e.g., Mercedes, Nissan, etc.)");
        return;
      }

      addBotMessage(
        `Great! You have a ${brand}. Now, please upload a photo of your car so I can identify the model and color.`,
        [
          { label: '📷 Upload Car Photo', value: 'upload-car-photo-now' },
          { label: '💬 Type Model Instead', value: 'type-model' },
        ]
      );
      return;
    }

    // NOT SURE ABOUT BRAND
    if (option.value === 'not-sure-brand') {
      addBotMessage(
        "No worries! Let's use a photo to identify your car. Please upload a clear photo of your vehicle.",
        [{ label: '📷 Upload Car Photo', value: 'upload-car-photo-now' }]
      );
      setWaitingForImageType('car');
      return;
    }

    // UPLOAD PHOTO INSTEAD (from welcome)
    if (option.value === 'upload-photo-instead') {
      addBotMessage(
        "Perfect! Please upload a clear photo of your car. I'll identify the brand, model, and color.",
        [{ label: '📷 Upload Photo', value: 'upload-car-photo-now' }]
      );
      setWaitingForImageType('car');
      return;
    }

    // UPLOAD CAR PHOTO (after brand selection or from "not sure")
    if (option.value === 'upload-car-photo-now') {
      setWaitingForImageType('car');
      addBotMessage("Great! Please upload a clear photo of your car.");
      return;
    }

    // TYPE MODEL MANUALLY
    if (option.value === 'type-model') {
      addBotMessage("Sure! Please tell me your car's model and year (e.g., Camry 2020)");
      return;
    }

    // UPLOAD VIN TAG
    if (option.value === 'upload-vin-tag' || option.value === 'upload-vin-photo') {
      setWaitingForImageType('vin');
      addBotMessage(
        "Perfect! Please upload a clear photo of your VIN tag/sticker.\n\n💡 **Tip:** The VIN tag is usually on the driver's door jamb and contains your exact paint code!"
      );
      return;
    }

    // FOUND PAINT CODE (user will type it)
    if (option.value === 'found-paint-code') {
      addBotMessage("Excellent! Please type your paint code exactly as it appears on the sticker.");
      return;
    }

    // CONFIRM COLOR FROM PHOTO
    if (option.value === 'confirm-yes' || option.value === 'confirm-vin-yes') {
      addBotMessage(
        "Perfect! Now let's find your exact paint code.\n\n**Important:** Car photos show the color, but there can be dozens of shades of the same color! For 100% accuracy, we need to find the paint code on your VIN sticker.\n\nWould you like to:",
        [
          { label: '📷 Upload VIN Photo', value: 'upload-vin-photo' },
          { label: '🔍 I Found the Paint Code', value: 'found-paint-code' },
          { label: '❓ Where is the VIN?', value: 'where-is-vin' },
        ]
      );
      return;
    }

    // REJECT PHOTO ANALYSIS
    if (option.value === 'confirm-no') {
      addBotMessage(
        "No problem! Let's try a different approach.",
        [
          { label: '📷 Upload Different Photo', value: 'upload-car-photo-now' },
          { label: '💬 Type Car Details', value: 'type-model' },
          { label: '🔄 Start Over', value: 'start-over' },
        ]
      );
      return;
    }

    // WHERE IS VIN
    if (option.value === 'where-is-vin') {
      const brand = detectedInfo.brand || 'your vehicle';
      addBotMessage(
        `Here's where to find the VIN sticker on most ${brand} vehicles:\n\n` +
        `📍 **Most Common Locations:**\n` +
        `• Driver's side door jamb (open the door and look at the frame)\n` +
        `• Inside the driver's door edge\n` +
        `• Under the hood on the firewall\n\n` +
        `Look for a white or silver sticker with codes like "PAINT", "C/TR", or "EXT".\n\n` +
        `Ready to upload the VIN photo?`,
        [
          { label: '📷 Upload VIN Photo', value: 'upload-vin-photo' },
          { label: '✍️ Type Paint Code', value: 'found-paint-code' },
        ]
      );
      return;
    }

    // VIEW RESULTS
    if (option.value === 'view-results') {
      const url = buildResultUrl();
      if (url) {
        addBotMessage("Opening your personalized paint code page... 🎨");
        // Track successful paint code lookup
        trackAnalytics(true, detectedInfo.paintCode ?? undefined);
        setTimeout(() => {
          router.push(url);
        }, 500);
      } else {
        // Track failed attempt
        trackAnalytics(false);
      }
      return;
    }

    // START OVER
    if (option.value === 'start-over') {
      handleNewChat();
      return;
    }

    // Default: send to AI chat
    sendToChat(option.label);
  };

  const startNewChat = () => {
    setMessages([getWelcomeMessage()]);
    setConversationHistory([]);
    setDetectedInfo({});
    setCurrentOptions([]);
    setImageAnalysis(null);
    setCurrentChatId(null);
  };

  const handleNewChat = () => {
    saveCurrentChat();
    startNewChat();
  };

  const handleSelectChat = (id: string) => {
    // Save current chat first
    saveCurrentChat();

    // Load selected chat
    const chat = chatHistory.find(c => c.id === id);
    if (chat) {
      setMessages(chat.messages);
      setConversationHistory(chat.conversationHistory);
      setDetectedInfo(chat.detectedInfo);
      setCurrentChatId(id);
      setCurrentOptions([]);
      setImageAnalysis(null);
    }
  };

  const handleDeleteChat = (id: string) => {
    setChatHistory(prev => {
      const newHistory = prev.filter(c => c.id !== id);
      saveChats(newHistory);
      return newHistory;
    });

    // If deleting current chat, start new one
    if (id === currentChatId) {
      startNewChat();
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-[700px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Sidebar */}
      <ChatSidebar
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-50 to-blue-50/30 min-w-0">
        {/* Header with toggle button */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Paint Code Assistant</h2>
            <p className="text-xs text-gray-500 hidden sm:block mt-0.5">AI-powered color matching</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Temporary test button */}
            <a
              href="/paint-code/acura/nsx/2024/yr506m"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              View Paint Page
            </a>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              100% Free
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </span>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
                  <path d="M12 2a2 2 0 012 2v1h2a4 4 0 014 4v9a4 4 0 01-4 4H8a4 4 0 01-4-4V9a4 4 0 014-4h2V4a2 2 0 012-2zm-3 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
                </svg>
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Options area */}
        {currentOptions.length > 0 && !isTyping && (
          <ChatOptions options={currentOptions} onSelect={handleOptionSelect} />
        )}

        {/* Input area */}
        <ChatInput
          onSubmit={handleTextSubmit}
          onImageUpload={handleImageUpload}
          disabled={isTyping}
        />
      </div>
    </div>
  );
}
