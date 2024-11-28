import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SearchAndCards from './SearchAndCards';
import FloatingSubmitButton from './FloatingSubmitButton';

document.documentElement.style.backgroundColor = '#034641';
document.body.style.backgroundColor = '#034641';

const MainApp = () => {
  const [showButton, setShowButton] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowButton(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: '50px' // Add some margin to trigger earlier
      }
    );
    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-primary">
      {/* Main content wrapper */}
      <div className="flex flex-col min-h-screen bg-primary">
        {/* Main content area */}
        <div className="flex-1">
          <SearchAndCards />
        </div>
        
        {/* Bottom detector */}
        <div ref={bottomRef} className="h-1 w-full bg-primary" />
        
        {/* Floating button with transition */}
        <div
          className={`
            fixed bottom-0 left-0 right-0 
            transform transition-transform duration-300 ease-in-out
            ${showButton ? 'translate-y-0' : 'translate-y-full'}
            bg-primary pb-4 pt-8
          `}
        >
          <FloatingSubmitButton />
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);