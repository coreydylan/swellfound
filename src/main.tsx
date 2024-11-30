import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SearchAndCards from './SearchAndCards';
import FloatingSubmitButton from './FloatingSubmitButton';

// Set background colors for the document and body
document.documentElement.style.backgroundColor = '#034641';
document.body.style.backgroundColor = '#034641';

const MainApp = () => {
  const [showButton, setShowButton] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check if we're at the bottom of the page
      const isBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;
      setIsAtBottom(isBottom);

      // Show button if we're at the top or bottom; hide it otherwise
      if (window.scrollY < 100 || isBottom) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-primary pb-16">
      {/* SearchAndCards Component */}
      <SearchAndCards />

      {/* Floating Submit Button */}
      {showButton && (
        <div
          className={`fixed bg-primary transition-all duration-200 ${
            isAtBottom
              ? 'bottom-0 left-0 right-0 p-4 border-t border-primary-tint2/10'
              : 'bottom-4 right-4 shadow-lg'
          }`}
        >
          <div className={isAtBottom ? 'max-w-2xl mx-auto' : ''}>
            <FloatingSubmitButton />
          </div>
        </div>
      )}
    </div>
  );
};

// Render the application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);