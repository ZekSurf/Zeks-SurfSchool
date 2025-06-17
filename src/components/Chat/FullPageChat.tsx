import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SurfBotThinking } from './SurfBotThinking';
import { chatService } from '@/lib/chatService';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

export const FullPageChat: React.FC = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [conversationStage, setConversationStage] = useState<'initial' | 'engaged' | 'booking' | 'general'>('initial');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageProcessed = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setIsClient(true);
    
    // Only add welcome message if there's no initial message in the URL
    if (!router.query.message) {
      const welcomeMessage: ChatMessageType = {
        id: uuidv4(),
        content: "Hey! I'm **SurfBot** 🤙. Ask me anything about *lessons*, **pricing**, or what to bring!",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [router.query.message]);

  // Function to cycle through conversation stages after each user message
  const updateConversationStage = () => {
    setConversationStage(currentStage => {
      switch (currentStage) {
        case 'initial':
          return 'engaged';
        case 'engaged':
          return 'booking';
        case 'booking':
          return 'general';
        case 'general':
          return 'engaged'; // Cycle back to engaged, skipping initial
        default:
          return 'engaged';
      }
    });
  };

  const processInitialMessage = async (message: string) => {
    const initialMessages: ChatMessageType[] = [];
    
    // Add welcome message first
    const welcomeMessage: ChatMessageType = {
      id: uuidv4(),
      content: "Hey! I'm **SurfBot** 🤙. Ask me anything about *lessons*, **pricing**, or what to bring!",
      sender: 'bot',
      timestamp: new Date(),
    };
    initialMessages.push(welcomeMessage);
    
    // Add user's message
    const userMessage: ChatMessageType = {
      id: uuidv4(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };
    initialMessages.push(userMessage);

    setMessages(initialMessages);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(message);
      
      const botMessage: ChatMessageType = {
        id: uuidv4(),
        content: response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
      updateConversationStage();
    } catch (err) {
      console.error('Error in processInitialMessage:', err);
      
      // Show more specific error messages
      let errorMessage = 'Failed to send message. Please try again.';
      if (err instanceof Error) {
        if (err.message.includes('webhook URL not configured')) {
          errorMessage = 'Chat service is not configured. Please check your environment settings.';
        } else if (err.message.includes('HTTP error')) {
          errorMessage = 'Unable to connect to chat service. Please try again later.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Handle initial message from URL query
    const { message } = router.query;
    if (message && typeof message === 'string' && !initialMessageProcessed.current) {
      initialMessageProcessed.current = true;
      processInitialMessage(message);
    }
  }, [router.query]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessageType = {
      id: uuidv4(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(content);
      
      const botMessage: ChatMessageType = {
        id: uuidv4(),
        content: response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
      updateConversationStage();
    } catch (err) {
      console.error('Error in handleSendMessage:', err);
      
      // Show more specific error messages
      let errorMessage = 'Failed to send message. Please try again.';
      if (err instanceof Error) {
        if (err.message.includes('webhook URL not configured')) {
          errorMessage = 'Chat service is not configured. Please check your environment settings.';
        } else if (err.message.includes('HTTP error')) {
          errorMessage = 'Unable to connect to chat service. Please try again later.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setConversationStage('initial');
    chatService.resetSession();
    initialMessageProcessed.current = false;
    
    // Add welcome message after reset
    const welcomeMessage: ChatMessageType = {
      id: uuidv4(),
      content: "Hey! I'm **SurfBot** 🤙. Ask me anything about *lessons*, **pricing**, or what to bring!",
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  // Dynamic suggestion questions based on conversation stage
  const getSuggestionQuestions = () => {
    switch (conversationStage) {
      case 'initial':
        return [
          "Tell me about Zek",
          "What beaches are available?",
          "What kind of lessons are available?",
          "How is the pricing decided?"
        ];
      case 'engaged':
        return [
          "What should I bring?",
          "How do I book a lesson?",
          "What's the cancellation policy?",
          "Do you provide equipment?"
        ];
      case 'booking':
        return [
          "Do you offer multi-lesson packages?",
          "What's included in the lesson?",
          "Group or private lesson?",
          "Best beach for beginners?"
        ];
      case 'general':
        return [
          "What should I bring to my first lesson?",
          "Any beginner tips?",
          "How long are lessons?",
          "Where do we meet?"
        ];
      default:
        return [
          "Tell me about Zek",
          "What beaches are available?",
          "What kind of lessons are available?",
          "How is the pricing decided?"
        ];
    }
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="h-full w-full flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 min-[427px]:p-6 chat-container">
        <div className="w-full max-w-7xl mx-auto">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && <SurfBotThinking />}
          {error && (
            <div className="text-red-500 text-sm p-4 bg-red-50 rounded-lg mb-4 border border-red-200">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area with Suggestion Prompts */}
      <div className="bg-white border-t">
        <div className="w-full max-w-7xl mx-auto">
          {/* Suggestion Prompts - Right above text box */}
          <div className="px-4 min-[427px]:px-6 pt-3 pb-1">
            <motion.div 
              key={conversationStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-wrap gap-2 justify-center"
            >
              {getSuggestionQuestions().map((question, index) => (
                <motion.button
                  key={`${conversationStage}-${index}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => handleSendMessage(question)}
                  disabled={isLoading}
                  className="bg-[#E8F7F7] text-gray-700 px-3 py-1.5 min-[427px]:px-4 min-[427px]:py-2 rounded-full text-xs min-[427px]:text-sm hover:bg-[#d8f1f1] transition-colors font-poppins whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {question}
                </motion.button>
              ))}
            </motion.div>
          </div>
          
          {/* Text Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}; 