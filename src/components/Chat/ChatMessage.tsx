import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { User, Home, Calendar } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

// Function to parse markdown-style text and convert to JSX
const parseMessageText = (text: string): React.ReactNode => {
  if (!text) return text;
  
  const parts = [];
  let currentIndex = 0;
  
  // Regular expressions for different markdown patterns
  const patterns = [
    { regex: /\*\*(.*?)\*\*/g, component: 'bold' },
    { regex: /\*(.*?)\*/g, component: 'italic' },
    { regex: /__(.*?)__/g, component: 'underline' },
    { regex: /`(.*?)`/g, component: 'code' },
    { regex: /~~(.*?)~~/g, component: 'strikethrough' }
  ];
  
  // Find all matches for all patterns
  const allMatches: Array<{
    start: number;
    end: number;
    text: string;
    component: string;
    content: string;
  }> = [];
  
  patterns.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    while ((match = regex.exec(text)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        component: pattern.component,
        content: match[1]
      });
    }
  });
  
  // Sort matches by start position
  allMatches.sort((a, b) => a.start - b.start);
  
  // Remove overlapping matches (keep the first one)
  const filteredMatches = [];
  let lastEnd = 0;
  for (const match of allMatches) {
    if (match.start >= lastEnd) {
      filteredMatches.push(match);
      lastEnd = match.end;
    }
  }
  
  // Build the result
  let lastIndex = 0;
  let keyCounter = 0;
  
  filteredMatches.forEach(match => {
    // Add text before the match
    if (match.start > lastIndex) {
      const beforeText = text.slice(lastIndex, match.start);
      if (beforeText) {
        parts.push(beforeText);
      }
    }
    
    // Add the formatted element
    const key = `formatted-${keyCounter++}`;
    switch (match.component) {
      case 'bold':
        parts.push(<strong key={key} className="font-semibold">{match.content}</strong>);
        break;
      case 'italic':
        parts.push(<em key={key} className="italic">{match.content}</em>);
        break;
      case 'underline':
        parts.push(<u key={key} className="underline">{match.content}</u>);
        break;
      case 'code':
        parts.push(
          <code key={key} className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono">
            {match.content}
          </code>
        );
        break;
      case 'strikethrough':
        parts.push(<s key={key} className="line-through">{match.content}</s>);
        break;
      default:
        parts.push(match.content);
    }
    
    lastIndex = match.end;
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (remainingText) {
      parts.push(remainingText);
    }
  }
  
  return parts.length > 0 ? parts : text;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const router = useRouter();

  const handleBookClick = () => {
    router.push('/#booking');
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  if (isUser) {
    // Simple layout for user messages (original structure)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start space-x-3 mb-4 flex-row-reverse space-x-reverse"
      >
        <div className="flex-shrink-0 w-10 h-10 min-[427px]:w-12 min-[427px]:h-12 rounded-full flex items-center justify-center bg-gray-600">
          <User className="w-5 h-5 min-[427px]:w-6 min-[427px]:h-6 text-white" />
        </div>
        
        <div className="max-w-[85%] min-[427px]:max-w-[75%] lg:max-w-[65%] px-4 py-2 rounded-lg break-words bg-white text-gray-800 rounded-br-none shadow-sm border">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
            {parseMessageText(message.content)}
          </p>
          <p className="text-[10px] mt-1 text-gray-500">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </motion.div>
    );
  }

  // Enhanced layout for bot messages with action buttons
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start space-x-3 mb-4"
    >
      <div className="flex-shrink-0 w-10 h-10 min-[427px]:w-12 min-[427px]:h-12 rounded-full flex items-center justify-center bg-transparent">
        <Image
          src="/Surfbot.png"
          alt="SurfBot"
          width={48}
          height={48}
          className="w-10 h-10 min-[427px]:w-12 min-[427px]:h-12 rounded-full object-cover"
        />
      </div>
      
      <div className="flex flex-col">
        <div className="max-w-[85%] min-[427px]:max-w-[75%] lg:max-w-[65%] px-4 py-2 rounded-lg break-words bg-[#1DA9C7] text-white rounded-bl-none">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
            {parseMessageText(message.content)}
          </p>
          <p className="text-[10px] mt-1 text-blue-50">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
        
        {/* Action buttons for bot messages */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex gap-2 mt-2"
        >
          <button
            onClick={handleBookClick}
            className="flex items-center gap-1.5 bg-white text-[#1DA9C7] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm border border-[#1DA9C7]/20"
          >
            <Calendar className="w-3 h-3" />
            Book
          </button>
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors shadow-sm"
          >
            <Home className="w-3 h-3" />
            Home
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}; 