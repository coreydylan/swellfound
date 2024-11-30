import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const welcomeMessages = [
  "At SwellFound, we believe life gets better when we raise our standards. We're creating a future where making good choices is simple, and quality is clear. We're just getting started, but we wanted to begin by sharing some of our Standards for living well.",
  "For now, we're focusing on three categories: tools that last generations, techniques that become second nature, toys that make life richer.",
  "A standard might be a perfectly designed tool that lasts decades, a morning ritual that centers your day, or a technique that makes everyday moments better. Each one is chosen because it creates lasting value.",
  [
    "Begin your search. Looking to brew better coffee? Want to organize your kitchen beautifully? Ready to master bread making? Each standard comes from years of real experience. Ready to explore?",
    true // Flag to indicate this is the last card
  ],
];

const WelcomeCards: React.FC<{ 
  onComplete: (dontShowAgain: boolean) => void; 
  cardWidth: string 
}> = ({
  onComplete,
  cardWidth,
}) => {
  const [cards, setCards] = useState(welcomeMessages);
  const [isDragging, setIsDragging] = useState(false);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate the maximum height of all cards
  useEffect(() => {
    const heights = cardRefs.current.map((ref) => ref?.offsetHeight || 0);
    setMaxHeight(Math.max(...heights));
  }, [cards]);
  

  // Handle card removal logic
  const removeCard = () => {
    setCards((prev) => {
      const newCards = prev.slice(1);
      if (newCards.length === 0) {
        // Delay the onComplete call to avoid setState warnings
        setTimeout(() => onComplete(dontShowAgain), 0);
      }
      return newCards;
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative flex justify-center items-center h-[400px]"
      style={{ touchAction: 'none' }}
    >
      <AnimatePresence>
        {cards.map((messageData, index) => {
          const [message, isLastCard] = Array.isArray(messageData) 
            ? [messageData[0], messageData[1]] 
            : [messageData, false];

          return (
            <motion.div
              key={`card-${index}`}
              ref={(el) => (cardRefs.current[index] = el)}
              className="absolute p-6 bg-secondary rounded-lg shadow-lg border border-primary text-primary"
              style={{
                width: cardWidth,
                height: maxHeight || 'auto',
                zIndex: cards.length - index,
                top: index * 5,
                left: index * 5,
                pointerEvents: index === 0 ? 'auto' : 'none',
                touchAction: 'none',
              }}
              initial={{ scale: 1, x: 0 }}
              animate={{ scale: 1, x: 0 }}
              exit={{
                x: -1000,
                opacity: 0,
                transition: { duration: 0.3, ease: 'easeOut' },
              }}
              drag={index === 0 ? 'x' : false}
              dragConstraints={containerRef}
              dragElastic={0.5}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={(_, info) => {
                setIsDragging(false);
                if (Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 500) {
                  removeCard();
                }
              }}
              onClick={() => {
                if (!isDragging && index === 0) removeCard();
              }}
            >
              <p className="text-sm text-left mb-6">{message}</p>

              {/* Don't show again checkbox for last card */}
              {index === 0 && isLastCard && (
                <div 
                  className="absolute bottom-4 left-4 flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    id="dontShowAgain"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="
                      w-4 h-4 
                      text-[#034641] 
                      border-[#034641] 
                      rounded 
                      focus:ring-[#034641]
                      cursor-pointer
                    "
                  />
                  <label 
                    htmlFor="dontShowAgain" 
                    className="text-xs text-[#034641] cursor-pointer"
                  >
                    Don't show this introduction again
                  </label>
                </div>
              )}

              {index === 0 && (
                <motion.div
                  className="absolute bottom-4 right-4"
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: 'easeInOut',
                  }}
                >
                  <ArrowRight size={16} className="text-tertiary" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default WelcomeCards;