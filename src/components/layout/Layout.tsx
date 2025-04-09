import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 container mx-auto">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6 text-[#b89333] font-['Poppins']">
          {title}
        </h1>
        
        {children}
      </main>
    </div>
  );
};

export default Layout;
