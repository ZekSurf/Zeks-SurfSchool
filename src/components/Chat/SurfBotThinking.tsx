import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export const SurfBotThinking: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start space-x-3 mb-4"
    >
      {/* SurfBot Avatar */}
      <div className="flex-shrink-0 w-10 h-10 min-[427px]:w-12 min-[427px]:h-12 rounded-full flex items-center justify-center bg-transparent">
        <Image
          src="/Surfbot.png"
          alt="SurfBot"
          width={48}
          height={48}
          className="w-10 h-10 min-[427px]:w-12 min-[427px]:h-12 rounded-full object-cover"
        />
      </div>
      
      {/* Thinking Bubble */}
      <div className="max-w-[85%] min-[427px]:max-w-[75%] lg:max-w-[65%] px-4 py-3 rounded-lg bg-[#1DA9C7] text-white rounded-bl-none">
        <div className="flex items-center space-x-2">
          {/* Surfboard emoji with gentle bounce */}
          <motion.span
            animate={{ 
              y: [0, -2, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-lg"
          >
            🏄‍♂️
          </motion.span>
          
          {/* Thinking text */}
          <span className="text-sm font-medium">SurfBot is thinking</span>
          
          {/* Animated dots */}
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
                className="w-1.5 h-1.5 bg-white rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 