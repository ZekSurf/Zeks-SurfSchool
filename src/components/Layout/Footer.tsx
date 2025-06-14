import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4 min-[731px]:px-6 min-[1024px]:px-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Social Media Links */}
          <div className="flex space-x-6">
            <Link 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#1DA9C7] transition-colors"
            >
              <Facebook size={24} />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#1DA9C7] transition-colors"
            >
              <Instagram size={24} />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link 
              href="https://tiktok.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#1DA9C7] transition-colors"
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6"
                aria-hidden="true"
              >
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0011.14-4.02v-7a8.16 8.16 0 004.65 1.48V7.1a4.79 4.79 0 01-1.2-.41z"/>
              </svg>
              <span className="sr-only">TikTok</span>
            </Link>
          </div>

          {/* Copyright Text */}
          <div className="text-gray-400 text-sm text-center">
            © 2025 Zek Surf School. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}; 