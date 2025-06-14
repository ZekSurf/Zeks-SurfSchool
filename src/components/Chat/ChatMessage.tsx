import React from 'react';
import { motion } from 'framer-motion';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { User, Bot } from 'lucide-react';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start space-x-3 mb-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-gray-600' : 'bg-[#1DA9C7]'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      
      <div className={`max-w-[85%] min-[427px]:max-w-[75%] lg:max-w-[65%] px-4 py-2 rounded-lg break-words ${
        isUser 
          ? 'bg-white text-gray-800 rounded-br-none shadow-sm border' 
          : 'bg-[#1DA9C7] text-white rounded-bl-none'
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
          {parseMessageText(message.content)}
        </p>
        <p className={`text-[10px] mt-1 ${
          isUser ? 'text-gray-500' : 'text-blue-50'
        }`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </motion.div>
  );
}; 