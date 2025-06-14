import React from 'react';
import { Waves } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-pacifico text-primary">
                Surf Concierge
              </h1>
              <p className="text-xs text-gray-600 -mt-1">
                AI-Powered Surf Lessons
              </p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#lessons" className="text-gray-700 hover:text-primary transition-colors">
              Lessons
            </a>
            <a href="#conditions" className="text-gray-700 hover:text-primary transition-colors">
              Conditions
            </a>
            <a href="#about" className="text-gray-700 hover:text-primary transition-colors">
              About
            </a>
            <a href="#contact" className="text-gray-700 hover:text-primary transition-colors">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}; 