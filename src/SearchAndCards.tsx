import React, { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import nlp from 'compromise';
import WelcomeCards from './WelcomeCards';
import { fetchAirtableData } from './airtable';

// Define AirtableRecord interface
interface AirtableRecord {
  id: string;
  Title: string;
  Standard: string;
  Type_Text: string;
  Quicktake: string;
  Details: string;
  Price: number;
  ImageURL: string;
  BuyURL: string;
  SustainabilityNotes: string;
}

// Standard Card Component
const StandardCard: React.FC<{
  record: AirtableRecord;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ record, isExpanded, onToggle }) => (
  <div
    className="relative p-6 cursor-pointer hover:shadow-lg transition-all duration-200 rounded-lg border border-secondary bg-secondary"
    onClick={onToggle}
  >
    {/* Type Tag */}
    <div
      className="absolute top-3 right-3 px-3 py-1 text-sm font-semibold"
      style={{
        backgroundColor: '#034641',
        color: '#dcf0fa',
        letterSpacing: '0.05em',
        borderRadius: '9999px',
      }}
    >
      {record.Type_Text}
    </div>

    {/* Main Content */}
    <div className="flex gap-6">
      {record.ImageURL && (
        <div className="flex-shrink-0 w-32 h-32">
          <img
            src={record.ImageURL}
            alt={record.Title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      )}
      <div className="flex-grow text-left">
        <h3 className="text-sm mb-1 font-medium" style={{ color: '#367974' }}>
          {record.Title}
        </h3>
        <h2 className="text-xl font-bold mb-2" style={{ color: '#034641' }}>
          {record.Standard}
        </h2>
        <p className="text-sm" style={{ color: '#1c5f5a' }}>
          {record.Quicktake}
        </p>
      </div>
    </div>

    {/* Expanded Content */}
    {isExpanded && (
      <div className="mt-6 pt-6 border-t" style={{ borderColor: '#0abeb4' }}>
        <p className="prose text-sm mb-6 text-left" style={{ color: '#1c5f5a' }}>
          {record.Details}
        </p>
      </div>
    )}
  </div>
);

const SearchAndCards: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<AirtableRecord[]>([]);
  const [filteredRecs, setFilteredRecs] = useState<AirtableRecord[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const searchBarRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const [logoOffset, setLogoOffset] = useState<number>(250); // Default offset

  useEffect(() => {
    const loadData = async () => {
      try {
        const data: AirtableRecord[] = await fetchAirtableData();
        setRecommendations(data);
      } catch (error) {
        console.error('Error fetching data from Airtable:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const updateLogoPosition = () => {
      if (!searchBarRef.current || !cardsRef.current) return;

      const searchBarBottom = searchBarRef.current.getBoundingClientRect().bottom;
      const cardsBottom = cardsRef.current.getBoundingClientRect().bottom;
      const viewportHeight = window.innerHeight;

      // Adjust for mobile and desktop
      if (window.innerWidth <= 768) {
        const mobileOffset = (cardsBottom + viewportHeight) / 2 - 150;
        setLogoOffset(mobileOffset);
      } else {
        setLogoOffset(searchBarBottom + 250); // Desktop: 250px below the search bar
      }
    };

    // Update on mount and resize
    updateLogoPosition();
    window.addEventListener('resize', updateLogoPosition);
    return () => window.removeEventListener('resize', updateLogoPosition);
  }, []);

  const debouncedFilter = debounce((query: string) => {
    if (!query.trim()) {
      setFilteredRecs([]);
      return;
    }

    const doc = nlp(query.toLowerCase().trim());
    const processedQuery = doc.out('text');

    const queryTerms = processedQuery.split(' ');

    const filtered = recommendations.filter((rec) => {
      const combinedFields = `${rec.Title || ''} ${rec.Quicktake || ''} ${rec.Details || ''} ${rec.Type_Text || ''}`.toLowerCase();
      return queryTerms.some((term: string) => combinedFields.includes(term));
    });

    setFilteredRecs(filtered);
  }, 300);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setShowWelcome(false);
  };

  useEffect(() => {
    debouncedFilter(searchQuery);
  }, [searchQuery, recommendations]);

  const toggleExpand = (id: string) => {
    setSelectedItemId((prev) => (prev === id ? null : id));
  };

  const cardWidth =
    searchBarRef.current?.getBoundingClientRect().width || '100%';

  return (
    <div className="min-h-screen bg-primary text-secondary p-6 main-container pt-[5%] relative">
      <div className="max-w-2xl mx-auto text-center">
        {/* Top Logo */}
        <img
          src="/wordmark.svg"
          alt="SwellFound Logo"
          className="mx-auto mb-8 h-24"
        />

        {/* Search Bar */}
        <div className="relative w-full mb-6" ref={searchBarRef}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full p-4 pr-12 border border-secondary rounded-lg shadow-sm bg-secondary text-primary"
          />
        </div>

        {/* Animated S Logo */}
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 transition-opacity duration-500 ${
            searchQuery ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{
            top: `${logoOffset}px`,
          }}
        >
          <div className="w-24 h-24">
            <img
              src="/slogo.svg"
              alt="SwellFound S Logo"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Welcome Cards */}
        {showWelcome && (
          <div ref={cardsRef}>
            <WelcomeCards
              onComplete={() => setShowWelcome(false)}
              cardWidth={`${cardWidth}px`}
            />
          </div>
        )}

        {/* Results Area */}
        {!showWelcome && (
          <div className="grid grid-cols-1 gap-4" ref={cardsRef}>
            {filteredRecs.length > 0 ? (
              filteredRecs.map((rec) => (
                <StandardCard
                  key={rec.id}
                  record={rec}
                  isExpanded={rec.id === selectedItemId}
                  onToggle={() => toggleExpand(rec.id)}
                />
              ))
            ) : (
              searchQuery.trim() && <p>No results found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndCards;