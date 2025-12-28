'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage as ChatMessageType, ChatOption } from '@/types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatOptions } from './ChatOptions';
import { ChatSidebar } from './ChatSidebar';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Welcome message
const getWelcomeMessage = (): ChatMessageType => ({
  id: generateId(),
  type: 'bot',
  content: "Hi! I'm your Paint Code Expert. I can help you find the exact paint code for your car.\n\nYou can:\n• Upload a photo of your car and I'll analyze it\n• Or just tell me your car's make, model, and year\n\nHow would you like to start?",
  timestamp: new Date(),
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

interface DetectedInfo {
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  paintCode?: string | null;
  colorName?: string | null;
}

const STORAGE_KEY = 'findmypaintcode_chats';

// Load chats from localStorage
const loadChats = (): ChatHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
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

// Save chats to localStorage
const saveChats = (chats: ChatHistoryItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch (e) {
    console.error('Failed to save chats:', e);
  }
};

export function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessageType[]>([getWelcomeMessage()]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [detectedInfo, setDetectedInfo] = useState<DetectedInfo>({});
  const [currentOptions, setCurrentOptions] = useState<ChatOption[]>([]);
  const [imageAnalysis, setImageAnalysis] = useState<unknown>(null);

  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chats on mount
  useEffect(() => {
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

        // Update detected info
        if (aiResponse.detectedInfo) {
          setDetectedInfo(prev => ({
            ...prev,
            ...Object.fromEntries(
              Object.entries(aiResponse.detectedInfo).filter(([, v]) => v !== null)
            ),
          }));
        }

        // Convert suggested options to ChatOptions
        const options: ChatOption[] = aiResponse.suggestedOptions?.map((opt: string) => ({
          label: opt,
          value: opt.toLowerCase().replace(/\s+/g, '-'),
        })) || [];

        addBotMessage(aiResponse.message, options.length > 0 ? options : undefined);

        // Handle actions
        if (aiResponse.action === 'show_result' && detectedInfo.paintCode) {
          const url = `/paint-code/${detectedInfo.brand?.toLowerCase()}/${detectedInfo.model?.toLowerCase().replace(/\s+/g, '-')}/${detectedInfo.year}/${detectedInfo.paintCode?.toLowerCase().replace(/\s+/g, '-')}`;
          addBotMessage(`Great! I found your paint code. [View your paint options](${url})`);
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

        if (analysis.confidence === 'high' && analysis.possiblePaintCodes?.length > 0) {
          message += "I'm fairly confident about this match! Want me to show you exactly where to find the paint code sticker on your car?";
        } else {
          message += "Is this identification correct? Once confirmed, I can help you locate the paint code on your vehicle.";
        }

        const options: ChatOption[] = [
          { label: 'Yes, that\'s correct', value: 'confirm-yes' },
          { label: 'No, let me describe my car', value: 'confirm-no' },
          { label: 'Show me where to find the code', value: 'show-location' },
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

  const handleTextSubmit = (text: string) => {
    addUserMessage(text);
    sendToChat(text);
  };

  const handleImageUpload = (imageUrl: string) => {
    addUserMessage("Here's a photo of my car", imageUrl);
    analyzeImage(imageUrl);
  };

  const handleOptionSelect = (option: ChatOption) => {
    addUserMessage(option.label);
    setCurrentOptions([]);
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
