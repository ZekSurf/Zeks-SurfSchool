import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { CartIcon } from '@/components/Cart/CartIcon';

interface NavbarProps {
  onBookClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onBookClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const isHomePage = router.pathname === '/';

  const handleNavigation = (sectionId: string) => {
    if (isHomePage) {
      // If on home page, scroll to section
      const section = document.getElementById(sectionId);
      if (section) {
        const navbarHeight = document.querySelector('nav')?.offsetHeight || 0;
        const sectionTop = section.offsetTop - navbarHeight;
        window.scrollTo({ top: sectionTop, behavior: 'smooth' });
      }
    } else {
      // If not on home page, navigate to home page with section hash
      router.push(`/#${sectionId}`);
    }
    setIsMenuOpen(false);
  };

  const handleHomeClick = () => {
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
    setIsMenuOpen(false);
  };

  const handleBookClick = () => {
    if (isHomePage) {
      onBookClick();
    } else {
      router.push('/#booking');
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white h-16 min-[427px]:h-20 lg:h-24 pl-2 pr-4 md:pl-4 md:pr-8 flex items-center justify-between fixed w-full top-0 z-50">
      {/* Logo */}
      <button onClick={handleHomeClick} className="flex items-center">
        <Image
          src="/zeko-logo.png"
          alt="Zeko Surf"
          width={100}
          height={100}
          className="w-[60px] h-[60px] min-[427px]:w-[80px] min-[427px]:h-[80px] lg:w-[100px] lg:h-[100px] object-contain"
          priority
        />
      </button>

      {/* Desktop Navigation Links */}
      <div className="hidden min-[1135px]:flex items-center space-x-32 ml-16">
        <button 
          onClick={handleHomeClick}
          className="text-black font-poppins text-[24px] font-bold hover:text-[#1DA9C7] transition-colors"
        >
          Home
        </button>
        <button 
          onClick={() => handleNavigation('about')}
          className="text-black font-poppins text-[24px] font-bold hover:text-[#1DA9C7] transition-colors"
        >
          About
        </button>
        <button 
          onClick={() => handleNavigation('blog')}
          className="text-black font-poppins text-[24px] font-bold hover:text-[#1DA9C7] transition-colors"
        >
          Blog
        </button>
        <button 
          onClick={() => handleNavigation('contact')}
          className="text-black font-poppins text-[24px] font-bold hover:text-[#1DA9C7] transition-colors"
        >
          Contact
        </button>
      </div>

      {/* Desktop Book Now Button and Cart */}
      <div className="hidden min-[1135px]:flex items-center space-x-6">
        <button 
          onClick={handleBookClick}
          className="bg-[#1DA9C7] text-white px-10 py-3 rounded-xl font-poppins font-bold hover:bg-[#1897B2] transition-colors text-[24px] shadow-lg"
        >
          Book now
        </button>
        <CartIcon />
      </div>

      {/* Mobile Menu Button and Cart */}
      <div className="flex min-[1135px]:hidden items-center space-x-4">
        <CartIcon />
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-black p-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-white transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } min-[1135px]:hidden`}
        style={{ top: '4rem', height: 'calc(100vh - 4rem)' }}
      >
        <div className="flex flex-col items-center pt-8 space-y-6">
          <button 
            onClick={handleHomeClick}
            className="text-black font-poppins text-[20px] min-[427px]:text-[24px] font-bold hover:text-[#1DA9C7] transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => handleNavigation('about')}
            className="text-black font-poppins text-[20px] min-[427px]:text-[24px] font-bold hover:text-[#1DA9C7] transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => handleNavigation('blog')}
            className="text-black font-poppins text-[20px] min-[427px]:text-[24px] font-bold hover:text-[#1DA9C7] transition-colors"
          >
            Blog
          </button>
          <button 
            onClick={() => handleNavigation('contact')}
            className="text-black font-poppins text-[20px] min-[427px]:text-[24px] font-bold hover:text-[#1DA9C7] transition-colors"
          >
            Contact
          </button>
          <button 
            onClick={handleBookClick}
            className="bg-[#1DA9C7] text-white px-8 min-[427px]:px-10 py-2.5 min-[427px]:py-3 rounded-xl font-poppins font-bold hover:bg-[#1897B2] transition-colors text-[20px] min-[427px]:text-[24px] shadow-lg"
          >
            Book now
          </button>
        </div>
      </div>
    </nav>
  );
}; 