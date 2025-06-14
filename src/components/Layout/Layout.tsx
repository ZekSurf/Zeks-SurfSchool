import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SurfbotButton } from '../Chat/SurfbotButton';

interface LayoutProps {
  children: React.ReactNode;
  onBookClick?: () => void;
  hideFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onBookClick = () => {}, 
  hideFooter = false 
}) => {
  return (
    <>
      <Navbar onBookClick={onBookClick} />
      <main className="min-h-screen">
        {children}
      </main>
      {!hideFooter && <Footer />}
      <SurfbotButton />
    </>
  );
}; 