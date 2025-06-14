import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

export const ChatWidget = () => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const bgStyle = { backgroundColor: 'rgba(255, 255, 255, 0.92)' };

  const handleSendMessage = (message: string) => {
    router.push({
      pathname: '/chat',
      query: { message }
    });
  };

  const handleSuggestionClick = (question: string) => {
    router.push({
      pathname: '/chat',
      query: { message: question }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleSendMessage(inputValue.trim());
    }
  };
  
  return (
    <div className="w-[90vw] min-[427px]:w-[400px] lg:w-[500px] rounded-3xl shadow-xl overflow-hidden font-poppins" style={bgStyle}>
      {/* Header */}
      <div className="p-4 pb-2 min-[427px]:p-6 min-[427px]:pb-3 lg:p-8 lg:pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[20px] min-[427px]:text-[24px] lg:text-[32px] font-bold text-gray-800 font-poppins">Questions? Ask SurfBot</h2>
          <span className="text-xl min-[427px]:text-2xl lg:text-3xl">🏄</span>
        </div>
        <p className="text-xs min-[427px]:text-sm lg:text-base text-gray-600 font-poppins">powered by AI</p>
      </div>

      {/* Chat Message */}
      <div className="p-4 pt-2 min-[427px]:p-6 min-[427px]:pt-2 lg:p-8 lg:pt-3">
        <div className="bg-[#1DA9C7] text-white p-3 min-[427px]:p-4 lg:p-6 rounded-2xl max-w-[80%]">
          <p className="text-[14px] min-[427px]:text-[16px] lg:text-[20px] font-poppins">
            Hey! I'm SurfBot 🤙. Ask me anything about lessons, pricing, or what to bring!
          </p>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="px-4 pb-3 min-[427px]:px-6 min-[427px]:pb-4 lg:px-8 lg:pb-6 grid grid-cols-2 gap-2 lg:gap-3">
        <button 
          onClick={() => handleSuggestionClick("Tell me about Zek")}
          className="bg-[#E8F7F7] text-gray-700 px-3 py-1.5 min-[427px]:px-4 min-[427px]:py-2 lg:px-6 lg:py-3 rounded-full text-xs min-[427px]:text-sm lg:text-base hover:bg-[#d8f1f1] transition-colors font-poppins"
        >
          Tell me about Zek
        </button>
        <button 
          onClick={() => handleSuggestionClick("What beaches are available?")}
          className="bg-[#E8F7F7] text-gray-700 px-3 py-1.5 min-[427px]:px-4 min-[427px]:py-2 lg:px-6 lg:py-3 rounded-full text-xs min-[427px]:text-sm lg:text-base hover:bg-[#d8f1f1] transition-colors font-poppins"
        >
          What beaches are available?
        </button>
        <button 
          onClick={() => handleSuggestionClick("What kind of lessons are available?")}
          className="bg-[#E8F7F7] text-gray-700 px-3 py-1.5 min-[427px]:px-4 min-[427px]:py-2 lg:px-6 lg:py-3 rounded-full text-xs min-[427px]:text-sm lg:text-base hover:bg-[#d8f1f1] transition-colors font-poppins"
        >
          What kind of lessons are available?
        </button>
        <button 
          onClick={() => handleSuggestionClick("How is the pricing decided?")}
          className="bg-[#E8F7F7] text-gray-700 px-3 py-1.5 min-[427px]:px-4 min-[427px]:py-2 lg:px-6 lg:py-3 rounded-full text-xs min-[427px]:text-sm lg:text-base hover:bg-[#d8f1f1] transition-colors font-poppins"
        >
          How is the pricing decided?
        </button>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 min-[427px]:p-4 lg:p-6 border-t border-gray-200">
        <div className="flex gap-2 lg:gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="type your question here..."
            className="flex-1 px-3 py-1.5 min-[427px]:px-4 min-[427px]:py-2 lg:px-6 lg:py-3 rounded-full border border-gray-200 focus:outline-none focus:border-[#1DA9C7] font-poppins text-sm min-[427px]:text-base lg:text-lg"
            style={bgStyle}
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-[#1DA9C7] text-white p-2 min-[427px]:p-3 lg:p-4 rounded-full hover:bg-[#1897B2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="min-[427px]:w-6 min-[427px]:h-6">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}; 