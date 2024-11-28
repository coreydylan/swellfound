import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SearchAndCards from './SearchAndCards';
import FloatingSubmitButton from './FloatingSubmitButton';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Main layout rendering */}
    <div className="relative">
      {/* SearchAndCards component */}
      <SearchAndCards />
      
      {/* Floating submit button, always visible */}
      <FloatingSubmitButton />
    </div>
  </React.StrictMode>
);