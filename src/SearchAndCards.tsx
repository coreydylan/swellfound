import React, { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import WelcomeCards from './WelcomeCards';
import { fetchAirtableData, AirtableRecord } from './airtable';
import Cookies from 'js-cookie';

function StandardCard({ record, isExpanded, onToggle }: {
  record: AirtableRecord;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 rounded-lg`}
      onClick={onToggle}
    >
      <div className="p-6 bg-[#e0eff9]">
        {/* Type Tag Container */}
        <div className="flex md:block">
          {record.Type_Text && record.Type_Text.length > 0 && (
            <div
              className="
                text-xs font-semibold uppercase
                md:absolute md:top-3 md:right-3
                mb-4
                md:mb-0
                border border-[#034641] px-2 py-1 rounded-md
                inline-block
              "
              style={{
                color: '#034641',
              }}
            >
              {record.Type_Text[0]}
            </div>
          )}
        </div>

        {/* Content Container */}
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
            <h3 className="text-sm mb-1 font-medium text-[#367974]">
              {record.Title}
            </h3>
            <h2 className="text-xl font-bold mb-2 text-[#034641]">
              {record.Standard}
            </h2>
            <p className="text-sm text-[#1c5f5a]">
              {record.Quicktake}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section - Lighter Color */}
      {isExpanded && (
        <div className="p-6 bg-[#e9f2f7]">
          <p className="prose text-sm mb-6 text-left text-[#1c5f5a]">
            {record.Details}
          </p>

          {/* Buy Button */}
          {(record.BuyURL || record.Price) && (
            <div className="flex gap-4 mt-4">
              {record.BuyURL && (
                <a
                  href={record.BuyURL}
                  className="px-6 py-2.5 rounded-lg transition-all duration-200 border border-[#367974]/20 text-[#034641] hover:bg-[#034641] hover:text-white hover:border-transparent hover:shadow-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {record.Price ? `Buy Now - ${record.Price}` : 'Where to Buy →'}
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchAndCards() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<AirtableRecord[]>([]);
  const [filteredRecs, setFilteredRecs] = useState<AirtableRecord[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [viewAll, setViewAll] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const searchBarRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const [logoOffset, setLogoOffset] = useState<number>(250);

  const WELCOME_COOKIE_NAME = 'hideWelcomeCards';

  const uniqueTypes = [
    ...new Set(recommendations.map((rec) => rec.Type_Text).flat()),
  ];

  useEffect(() => {
    const hideWelcomeCards = Cookies.get(WELCOME_COOKIE_NAME);
    if (hideWelcomeCards === 'true') {
      setShowWelcome(false);
    }
  }, []);

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

      if (window.innerWidth <= 768) {
        const mobileOffset = (cardsBottom + viewportHeight) / 2 - 150;
        setLogoOffset(mobileOffset);
      } else {
        setLogoOffset(searchBarBottom + 250);
      }
    };

    updateLogoPosition();
    window.addEventListener('resize', updateLogoPosition);
    return () => window.removeEventListener('resize', updateLogoPosition);
  }, []);

  const handleWelcomeComplete = (dontShowAgain: boolean) => {
    setShowWelcome(false);
    if (dontShowAgain) {
      Cookies.set(WELCOME_COOKIE_NAME, 'true', { expires: 365 });
    }
  };

  const debouncedFilter = debounce((query: string) => {
    let filtered = recommendations;

    if (!query.trim() && !selectedType) {
      setFilteredRecs(viewAll ? recommendations : []);
      return;
    }

    if (query.trim()) {
      const processedQuery = query.toLowerCase().trim();
      filtered = filtered.filter((rec) => {
        const combinedFields = [
          rec.Title,
          rec.Quicktake,
          rec.Details,
          rec.Type_Text,
          rec.Standard,
          rec.SustainabilityNotes,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return combinedFields.includes(processedQuery);
      });
    }

    if (selectedType) {
      filtered = filtered.filter((rec) => rec.Type_Text?.includes(selectedType));
    }

    setFilteredRecs(filtered);
  }, 300);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setShowWelcome(false);
    setViewAll(false);
  };

  const handleViewAllToggle = () => {
    const newViewAll = !viewAll;
    setViewAll(newViewAll);
    setShowWelcome(false);
    
    if (newViewAll) {
      setSearchQuery('');
      setSelectedType(null);
      setFilteredRecs(recommendations);
    } else {
      setSearchQuery('');
      setSelectedType(null);
      setFilteredRecs([]);
    }
  };

  const handleTypeFilterChange = (type: string) => {
    setSelectedType(type === '' ? null : type);
    if (type === '') {
      setFilteredRecs(recommendations);
    } else {
      const filtered = recommendations.filter(rec => rec.Type_Text?.includes(type));
      setFilteredRecs(filtered);
    }
  };

  useEffect(() => {
    debouncedFilter(searchQuery);
  }, [searchQuery, recommendations, selectedType, viewAll]);

  const toggleExpand = (id: string) => {
    setSelectedItemId((prev) => (prev === id ? null : id));
  };

  const cardWidth = searchBarRef.current?.getBoundingClientRect().width || '100%';

  return (
    <div className="min-h-screen bg-primary text-secondary p-6 main-container pt-[5%] relative">
      <div className="max-w-2xl mx-auto text-center">
        {/* Top Logo */}
        <img
          src="/wordmark.svg"
          alt="SwellFound Logo"
          className="mx-auto mb-8 h-12"
        />

        {/* Search Container */}
        <div className="space-y-2" ref={searchBarRef}>
          {/* Search Bar */}
          <div className="relative w-full mb-2">
            <input
              type="text"
              placeholder="search our Standards..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={viewAll}
              className="w-full p-4 pr-12 border border-secondary rounded-lg shadow-sm bg-secondary text-primary disabled:opacity-50 transition-colors duration-200"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#034641"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={viewAll ? 'opacity-50' : ''}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* View All Toggle */}
          <div className="flex justify-end">
            <button
              onClick={handleViewAllToggle}
              className="px-4 py-2 text-sm font-medium text-[#e0eff9] bg-transparent hover:underline hover:text-[#A7D6CB] rounded-lg transition-all duration-200"
            >
              {viewAll ? '← Back to Search' : 'view all Standards →'}
            </button>
          </div>

          {/* Type Filter */}
          <div 
            className={`
              transition-all duration-300 ease-in-out
              ${viewAll 
                ? 'opacity-100 max-h-20' 
                : 'opacity-0 max-h-0 overflow-hidden'
              }
            `}
          >
            <div className="flex justify-start">
              <select
                onChange={(e) => handleTypeFilterChange(e.target.value)}
                value={selectedType || ''}
                className="
                  w-48 px-3 py-2 text-sm
                  bg-[#e0eff9]/50 text-[#034641]
                  border border-[#034641]/20
                  rounded-lg
                  transition-all duration-200
                  hover:border-[#034641]/40
                  focus:outline-none focus:border-[#034641]/60
                  appearance-none
                  cursor-pointer
                  bg-no-repeat bg-right
                  pr-8
                "
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23034641' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.75rem center'
                }}
              >
                <option value="">All Types</option>
                {uniqueTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Animated S Logo */}
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 transition-opacity duration-500 ${
            searchQuery || viewAll ? 'opacity-0 pointer-events-none' : 'opacity-100'
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
              onComplete={handleWelcomeComplete}
              cardWidth={`${cardWidth}px`}
            />
          </div>
        )}

        {/* Results Area */}
        {!showWelcome && (
          <div className="grid grid-cols-1 gap-4 mt-4" ref={cardsRef}>
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
}

export default SearchAndCards;