import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export const SurfbotButton = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      // Get hero section height or use a default value
      const heroSection = document.getElementById('hero');
      const heroHeight = heroSection?.offsetHeight || window.innerHeight;
      
      // Show button when scrolled past hero section
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > heroHeight * 0.8); // Show after scrolling 80% of hero height
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Don't render on chat page
  if (router.pathname === '/chat') {
    return null;
  }

  // On homepage, show based on scroll position
  const shouldShow = router.pathname !== '/' || isVisible;

  return (
    <div 
      className={`
        fixed bottom-6 right-6 z-50
        transition-all duration-500 ease-in-out transform
        ${shouldShow ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-10 invisible pointer-events-none'}
      `}
      style={{ 
        transitionProperty: 'opacity, transform, visibility',
        willChange: 'opacity, transform, visibility'
      }}
    >
      <button
        onClick={() => router.push('/chat')}
        className="bg-[#1DA9C7] text-white rounded-full p-4 shadow-lg hover:bg-[#1897B2] transition-all duration-300 hover:scale-110 group"
        aria-label="Open Surfbot Chat"
      >
        <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-white text-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat with Surfbot
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={1.5} 
          stroke="currentColor" 
          className="w-8 h-8"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" 
          />
        </svg>
      </button>
    </div>
  );
}; 