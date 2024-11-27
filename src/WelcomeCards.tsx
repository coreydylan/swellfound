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

  useEffect(() => {
    // Calculate and set the maximum height of all cards
    const heights = cardRefs.current.map((ref) => ref?.offsetHeight || 0);
    const max = Math.max(...heights);
    setMaxHeight(max);
  }, []);

  const removeCard = () => {
    setCards((prev) => prev.slice(1));
    if (cards.length === 1) onComplete(); // Notify parent when all cards are swiped
  };

  return (
    <div className="relative flex justify-center items-center h-[400px]">
      <AnimatePresence>
        {cards.map((message, index) => (
          <motion.div
            key={index}
            ref={(el) => (cardRefs.current[index] = el)} // Attach ref to each card
            className={`absolute p-6 bg-secondary rounded-lg shadow-lg border border-primary text-primary`}
            style={{
              width: cardWidth, // Match the width of the search bar
              height: maxHeight || 'auto', // Apply the max height if calculated
              zIndex: cards.length - index,
              top: index * 5, // Stack appearance
              left: index * 5,
              pointerEvents: index === 0 ? 'auto' : 'none', // Only top card is interactive
            }}
            initial={{ scale: 1, y: 0 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ x: -1000, opacity: 0, rotate: -15 }}
            transition={{ duration: 0.5 }}
            drag={index === 0 ? 'x' : false} // Only top card is draggable
            dragConstraints={{ left: -1000, right: 0 }}
            dragElastic={0.5} // Makes the drag feel more responsive
            onDragStart={() => {
              if (index === 0) setIsDragging(true); // Only track dragging for top card
            }}
            onDragEnd={(e, info) => {
              setIsDragging(false);
              if (index === 0 && (info.offset.x < -50 || info.velocity.x < -500)) {
                removeCard(); // Trigger removal only for the top card
              }
            }}
            onClick={() => {
              if (!isDragging && index === 0) removeCard();
            }}
          >
            <p className="text-sm">{message}</p>
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