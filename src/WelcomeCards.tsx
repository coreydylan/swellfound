import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const welcomeMessages = [
  "At SwellFound, we believe life gets better when we raise our standards. We're creating a future where making good choices is simple, and quality is clear. We're just getting started, but we wanted to begin by sharing some of our Standards for living well.",
  "For now, we're focusing on three categories: TOOLS that last generations, TECHNIQUES that become second nature, TOYS that make life richer.",
  "A standard might be a perfectly designed tool that lasts decades, a morning ritual that centers your day, or a technique that makes everyday moments better. Each one is chosen because it creates lasting value.",
  "Begin your search. Looking to brew better coffee? Want to organize your kitchen beautifully? Ready to master bread making? Each standard comes from years of real experience. Ready to explore?",
];

const WelcomeCards: React.FC<{ onComplete: () => void; cardWidth: string }> = ({
  onComplete,
  cardWidth,
}) => {
  const [cards, setCards] = useState(welcomeMessages);
  const [isDragging, setIsDragging] = useState(false);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
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
        setTimeout(onComplete, 0);
      }
      return newCards;
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative flex justify-center items-center h-[400px]"
      style={{ touchAction: 'none' }} // Prevent default touch behaviors
    >
      <AnimatePresence>
        {cards.map((message, index) => (
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
            <p className="text-sm text-left">{message}</p>
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
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WelcomeCards;