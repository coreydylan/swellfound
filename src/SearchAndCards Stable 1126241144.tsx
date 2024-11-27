import React, { useState, useEffect } from 'react';
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
  Type?: string; // Name(s) from the expanded Type field
}

const SearchAndCards: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<AirtableRecord | null>(null);
  const [recommendations, setRecommendations] = useState<AirtableRecord[]>([]);
  const [filteredRecs, setFilteredRecs] = useState<AirtableRecord[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAirtableData();
        console.log('Fetched data:', data);
        setRecommendations(data);
        setFilteredRecs(data); // Set initial filtered records to all fetched data
      } catch (error) {
        console.error('Error fetching data from Airtable:', error);
      }
    };

    loadData();
  }, []);

  // Debounced search filter function
  const debouncedFilter = debounce((query: string) => {
    if (!query.trim()) {
      console.log('Search query is empty or whitespace. Showing all records.');
      setFilteredRecs(recommendations);
      return;
    }

    // NLP preprocessing of query
    const doc = nlp(query.toLowerCase().trim());
    const processedQuery = doc.out('text'); // Clean query
    console.log('Processed query:', processedQuery);

    const queryTerms = processedQuery.split(' '); // Split query into terms

    const filtered = recommendations.filter((rec) => {
      const title = rec.Title?.toLowerCase() || '';
      const quicktake = rec.Quicktake?.toLowerCase() || '';
      const details = rec.Details?.toLowerCase() || '';
      const type = rec.Type?.toLowerCase() || '';

      const combinedFields = `${title} ${quicktake} ${details} ${type}`.trim();

      // Check if any query term matches the combined fields
      return queryTerms.some((term) => combinedFields.includes(term));
    });

    console.log('Filtered records:', filtered);
    setFilteredRecs(filtered);
  }, 300);

  // UseEffect to update filteredRecs when searchQuery changes
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
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 border border-secondary rounded-lg shadow-sm bg-secondary text-primary mb-6"
        />

        {/* Animated S Logo */}
        <div
          className={`absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ${
            searchQuery ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="w-24 h-24">
            <img
              src="/slogo.svg"
              alt="SwellFound S Logo"
              className="w-full h-full animate-gradient-slow"
            />
          </div>
        </div>

        {/* Results Area */}
        <div
          className={`grid grid-cols-1 gap-4 transition-opacity duration-500 ${
            searchQuery ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {filteredRecs.length > 0 ? (
            filteredRecs.map((rec, index) => (
              <div
                key={rec.id}
                className={`relative p-4 border border-secondary rounded-lg shadow hover:shadow-lg transition-all bg-secondary text-primary cursor-pointer transform transition duration-700 ease-in-out delay-${
                  index * 150
                }`}
                onClick={() =>
                  setSelectedItem(selectedItem?.id === rec.id ? null : rec)
                }
              >
                {/* Type Bubble - Positioned in Top Right */}
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
                  {/* Conditionally Render Image Container */}
                  {rec.ImageURL && (
                    <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center rounded-md mr-4">
                      <img
                        src={rec.ImageURL} // Image URL
                        alt={rec.Title || 'Untitled'}
                        className="w-20 h-20 object-cover"
                      />
                    </div>
                  )}

                  {/* Title and Quick Take */}
                  <div className={`flex-grow text-left ${!rec.ImageURL ? 'ml-0' : ''}`}>
                    <h2 className="text-lg font-bold">{rec.Title || 'Untitled'}</h2>
                    <p className="text-sm text-gray-2">{rec.Quicktake || 'No quick take available.'}</p>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedItem?.id === rec.id && (
                  <div className="mt-4 text-left">
                    <p className="text-sm text-gray-3">{rec.Details || 'No details available.'}</p>
                    <p className="font-semibold">Price: ${rec.Price || 'N/A'}</p>
                  </div>
                )}
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