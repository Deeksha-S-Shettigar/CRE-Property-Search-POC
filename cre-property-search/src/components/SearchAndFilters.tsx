import { useState, useEffect } from 'react';
import type { Property } from '../types/Property';
import { useDebounce } from '../hooks/useDebounce';

interface SearchAndFiltersProps {
  properties: Property[];
  onFilteredProperties: (filteredProperties: Property[]) => void;
}

interface FilterState {
  searchTerm: string;
  selectedTypes: string[];
  priceRange: [number, number];
}

const SearchAndFilters = ({ properties, onFilteredProperties }: SearchAndFiltersProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedTypes: [],
    priceRange: [0, 1000000] // Default range
  });

  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  // Calculate price range from properties
  const minPrice = Math.min(...properties.map(p => p.price_per_sqft * p.total_sqft));
  const maxPrice = Math.max(...properties.map(p => p.price_per_sqft * p.total_sqft));

  // Property types
  const propertyTypes = ['office', 'retail', 'industrial', 'warehouse'];

  // Filter properties based on current filters
  useEffect(() => {
    let filtered = [...properties];

    // Search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchLower) ||
        property.description.toLowerCase().includes(searchLower) ||
        property.address.city.toLowerCase().includes(searchLower) ||
        property.address.state.toLowerCase().includes(searchLower) ||
        property.amenities.some(amenity => amenity.toLowerCase().includes(searchLower))
      );
    }

    // Type filter
    if (filters.selectedTypes.length > 0) {
      filtered = filtered.filter(property =>
        filters.selectedTypes.includes(property.type)
      );
    }

    // Price range filter
    filtered = filtered.filter(property => {
      const totalPrice = property.price_per_sqft * property.total_sqft;
      return totalPrice >= filters.priceRange[0] && totalPrice <= filters.priceRange[1];
    });

    onFilteredProperties(filtered);
  }, [properties, debouncedSearchTerm, filters, onFilteredProperties]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type]
    }));
  };

  const handlePriceRangeChange = (index: number, value: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [
        index === 0 ? value : prev.priceRange[0],
        index === 1 ? value : prev.priceRange[1]
      ]
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedTypes: [],
      priceRange: [minPrice, maxPrice]
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search properties by title, description, location, or amenities..."
            value={filters.searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
          <span className="font-medium">Filters</span>
          <svg className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {(filters.searchTerm || filters.selectedTypes.length > 0 || filters.priceRange[0] !== minPrice || filters.priceRange[1] !== maxPrice) && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {isFiltersOpen && (
        <div className="space-y-6 border-t border-gray-200 pt-6">
          {/* Property Type Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {propertyTypes.map((type) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.selectedTypes.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Price Range: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider absolute top-0"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatPrice(minPrice)}</span>
                <span>{formatPrice(maxPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;
