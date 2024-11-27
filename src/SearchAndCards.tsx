import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { fetchAirtableData } from './airtable';
import { debounce } from 'lodash';
import nlp from 'compromise';

interface AirtableRecord {
  id: string;
  Title?: string;
  Quicktake?: string;
  Details?: string;
  Price?: number;
  ImageURL?: string;
  Type?: string;
}

// Component to handle the animated S logo
const AnimatedSLogo: React.FC<{ showLogo: boolean }> = ({ showLogo }) => {
  if (!showLogo) return null;

  return createPortal(
    <div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
      style={{
        width: '96px',
        height: '96px',
      }}
    >
      <img
        src="/slogo.svg"
        alt="SwellFound S Logo"
        className="w-full h-full animate-gradient-slow"
      />
    </div>,
    document.body // Render outside the main DOM tree
  );
};

const SearchAndCards: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<AirtableRecord | null>(null);
  const [recommendations, setRecommendations] = useState<AirtableRecord[]>([]);
  const [filteredRecs, setFilteredRecs] = useState<AirtableRecord[]>([]);
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAirtableData();
        setRecommendations(data);
        setFilteredRecs(data);
      } catch (error) {
        console.error('Error fetching data from Airtable:', error);
      }
    };

    loadData();
  }, []);

  const debouncedFilter = debounce((query: string) => {
    if (!query.trim()) {
      setFilteredRecs(recommendations);
      return;
    }

    const doc = nlp(query.toLowerCase().trim());
    const processedQuery = doc.out('text');

    const queryTerms = processedQuery.split(' ');

    const filtered = recommendations.filter((rec) => {
      const combinedFields = `${rec.Title || ''} ${rec.Quicktake || ''} ${rec.Details || ''} ${rec.Type || ''}`.toLowerCase();
      return queryTerms.some((term: string) => combinedFields.includes(term));
    });

    setFilteredRecs(filtered);
  }, 300);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setShowLogo(query.trim() === ''); // Hide logo when typing
  };

  useEffect(() => {
    debouncedFilter(searchQuery);
  }, [searchQuery, recommendations]);

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
        <div className="relative w-full mb-6">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full p-4 pr-12 border border-secondary rounded-lg shadow-sm bg-secondary text-primary"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 11-1.414 1.414l-4.387-4.387zM8 14a6 6 0 100-12 6 6 0 000 12z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Render the animated S logo */}
        <AnimatedSLogo showLogo={showLogo} />

        {/* Results Area */}
        <div
          className={`grid grid-cols-1 gap-4 transition-opacity duration-500 ${
            searchQuery.length > 0 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {filteredRecs.length > 0 ? (
            filteredRecs.map((rec, index) => (
              <div
                key={rec.id}
                className="relative p-4 border border-secondary rounded-lg shadow hover:shadow-lg transition-all bg-secondary text-primary cursor-pointer transform transition duration-700"
                onClick={() =>
                  setSelectedItem(selectedItem?.id === rec.id ? null : rec)
                }
              >
                {/* Type Bubble */}
                {rec.Type && (
                  <div
                    className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: '#034641',
                      color: '#dcf0fa',
                    }}
                  >
                    {rec.Type}
                  </div>
                )}

                {/* Image and Title */}
                <div className="flex">
                  {rec.ImageURL && (
                    <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center rounded-md mr-4">
                      <img
                        src={rec.ImageURL}
                        alt={rec.Title || 'Untitled'}
                        className="w-20 h-20 object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-grow text-left">
                    <h2 className="text-lg font-bold">{rec.Title || 'Untitled'}</h2>
                    <p className="text-sm text-gray-2">{rec.Quicktake || 'No quick take available.'}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAndCards;