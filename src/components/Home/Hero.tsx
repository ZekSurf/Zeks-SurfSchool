import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChatWidget } from '../Chat/ChatWidget';

interface HeroProps {
  onBookClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger the animation after component mounts
    setIsVisible(true);
  }, []);

  const scrollToAbout = () => {
    const section = document.getElementById('about');
    if (section) {
      const navbarHeight = document.querySelector('nav')?.offsetHeight || 0;
      const sectionTop = section.offsetTop - navbarHeight;
      window.scrollTo({ top: sectionTop, behavior: 'smooth' });
    }
  };

  return (
    <div id="hero" className="relative min-h-screen w-full overflow-hidden pb-16">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={encodeURI("/Z7RV03766_SURF_WAIKIKI_ZEKE_2024-08-10 copy (2).JPEG")}
          alt="Surfing Background"
          fill
          quality={100}
          className="object-cover max-[427px]:object-[65%_center] scale-x-[-1]"
          priority
          sizes="100vw"
          style={{ objectPosition: 'center' }}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col items-center min-[1024px]:items-start min-[1024px]:block">
        <div className="w-full h-full mx-auto px-4 min-[731px]:px-8 min-[1024px]:px-16 pt-24 min-[731px]:pt-28 min-[1024px]:pt-40 min-[1280px]:pt-44">
          <div className="grid min-[1024px]:grid-cols-2 gap-4 min-[731px]:gap-6 min-[1024px]:gap-8 min-[1024px]:max-w-[1280px] min-[1024px]:mx-auto">
            {/* Left Column - Text Content */}
            <div 
              className={`
                text-center w-full mx-auto min-[1024px]:text-left min-[1024px]:pl-8
                transition-all duration-1000 transform
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
              `}
            >
              <h1 className="text-white text-[32px] min-[731px]:text-[48px] min-[1280px]:text-[64px] leading-tight font-bold font-poppins mx-auto min-[1024px]:mx-0 max-w-3xl">
                Learn to Surf with Confidence. Ride Your First Wave Today.
              </h1>
              <p className="text-white text-[16px] min-[731px]:text-[18px] min-[1280px]:text-[24px] mt-3 min-[731px]:mt-4 min-[1280px]:mt-6 mx-auto min-[1024px]:mx-0 max-w-2xl font-poppins">
                Whether you've never touched a board or just need a little guidance, we've got you. No pressure, all good vibes.
              </p>
              <div className="mt-4 min-[731px]:mt-6 min-[1280px]:mt-10 space-y-2 min-[731px]:space-y-0 min-[731px]:space-x-4 min-[1280px]:space-x-6 flex flex-col min-[731px]:flex-row min-[1024px]:items-center min-[1024px]:justify-start justify-center w-full">
                <button 
                  onClick={onBookClick}
                  className="bg-[#1DA9C7] text-white px-6 min-[731px]:px-6 min-[1280px]:px-10 py-2.5 min-[731px]:py-2.5 rounded-xl font-poppins font-bold text-[18px] min-[731px]:text-[16px] min-[1280px]:text-[24px] hover:bg-[#1897B2] transition-colors shadow-lg inline-block whitespace-nowrap"
                >
                  Book now
                </button>
                <button 
                  onClick={scrollToAbout}
                  className="bg-white text-[#1DA9C7] px-6 min-[731px]:px-6 min-[1280px]:px-10 py-2.5 min-[731px]:py-2.5 rounded-xl font-poppins font-bold text-[18px] min-[731px]:text-[16px] min-[1280px]:text-[24px] hover:bg-gray-100 transition-colors shadow-lg inline-block whitespace-nowrap"
                >
                  Learn more
                </button>
              </div>
            </div>

            {/* Right Column - Chat Widget */}
            <div 
              className={`
                flex justify-center mt-8 min-[731px]:mt-4 min-[1024px]:mt-0 min-[1024px]:justify-end min-[1024px]:-mr-8 min-[1280px]:mr-0 min-[1280px]:pr-16
                transition-all duration-1000 delay-500 transform
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
              `}
            >
              <div className="transform scale-[0.85] min-[731px]:scale-[0.85] min-[1280px]:scale-100 origin-top">
                <ChatWidget />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 