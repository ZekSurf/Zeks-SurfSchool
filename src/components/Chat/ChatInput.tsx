import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const singleLineHeight = 44;
      const maxHeight = 120;
      const scrollHeight = Math.max(textarea.scrollHeight, singleLineHeight);
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 min-[427px]:p-6">
      <div className="flex items-center gap-2 min-[427px]:gap-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything"
            className="w-full px-3 min-[427px]:px-4 py-2 min-[427px]:py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#1DA9C7] focus:border-transparent bg-gray-50 text-sm min-[427px]:text-base overflow-y-hidden"
            rows={1}
            disabled={disabled || isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className={`
            bg-[#1DA9C7] hover:bg-[#1897B2] text-white h-[44px] min-[427px]:h-[52px] 
            w-[44px] min-[427px]:w-[52px] rounded-xl flex items-center justify-center transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0
          `}
        >
          {isLoading ? (
            <div className="w-4 h-4 min-[427px]:w-5 min-[427px]:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4 min-[427px]:w-5 min-[427px]:h-5 translate-x-0.5" />
          )}
        </button>
      </div>
    </form>
  );
}; 