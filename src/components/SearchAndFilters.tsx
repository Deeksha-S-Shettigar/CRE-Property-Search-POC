import { useState, useEffect, useRef } from 'react';
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
  sizeRange: [number, number];
  selectedLocations: string[];
  selectedAmenities: string[];
  sortBy: string;
}

const SearchAndFilters = ({ properties, onFilteredProperties }: SearchAndFiltersProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [amenitiesSearchTerm, setAmenitiesSearchTerm] = useState('');
  
  const typeRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const amenitiesRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedTypes: [],
    priceRange: [0, 0], // Will be set after calculating min/max
    sizeRange: [0, 0], // Will be set after calculating min/max
    selectedLocations: [],
    selectedAmenities: [],
    sortBy: 'date_listed' // Default sort
  });

  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
      if (amenitiesRef.current && !amenitiesRef.current.contains(event.target as Node)) {
        setIsAmenitiesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate price range from properties
  const minPrice = Math.min(...properties.map(p => p.price_per_sqft * p.total_sqft));
  const maxPrice = Math.max(...properties.map(p => p.price_per_sqft * p.total_sqft));

  // Calculate size range from properties
  const minSize = 600; // Fixed minimum of 600 sqft
  const maxSize = Math.max(...properties.map(p => p.total_sqft));

  // Initialize ranges when properties change
  useEffect(() => {
    if (properties.length > 0) {
      setFilters(prev => ({
        ...prev,
        priceRange: [minPrice, maxPrice],
        sizeRange: [minSize, maxSize]
      }));
    }
  }, [properties, minPrice, maxPrice, minSize, maxSize]);

  // Property types
  const propertyTypes = ['office', 'retail', 'industrial', 'warehouse'];

  // Get unique locations
  const allLocations = Array.from(new Set(properties.map(p => `${p.address.city}, ${p.address.state}`))).sort();
  
  // Filter locations based on search term
  const locations = allLocations.filter(location =>
    location.toLowerCase().includes(locationSearchTerm.toLowerCase())
  );

  // Get unique amenities
  const allAmenities = Array.from(new Set(properties.flatMap(p => p.amenities))).sort();
  
  // Filter amenities based on search term
  const amenities = allAmenities.filter(amenity =>
    amenity.toLowerCase().includes(amenitiesSearchTerm.toLowerCase())
  );

  // Sort options
  const sortOptions = [
    { value: 'date_listed', label: 'Date Listed (Newest)' },
    { value: 'date_listed_old', label: 'Date Listed (Oldest)' },
    { value: 'price_low', label: 'Price (Low to High)' },
    { value: 'price_high', label: 'Price (High to Low)' },
    { value: 'size_large', label: 'Size (Large to Small)' },
    { value: 'size_small', label: 'Size (Small to Large)' },
    { value: 'title', label: 'Title (A-Z)' }
  ];

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

    // Size range filter
    filtered = filtered.filter(property => {
      return property.total_sqft >= filters.sizeRange[0] && property.total_sqft <= filters.sizeRange[1];
    });

    // Location filter
    if (filters.selectedLocations.length > 0) {
      filtered = filtered.filter(property => {
        const location = `${property.address.city}, ${property.address.state}`;
        return filters.selectedLocations.includes(location);
      });
    }

    // Amenities filter
    if (filters.selectedAmenities.length > 0) {
      filtered = filtered.filter(property => {
        return filters.selectedAmenities.every(amenity => 
          property.amenities.includes(amenity)
        );
      });
    }

    // Sort properties
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date_listed':
          return new Date(b.date_listed).getTime() - new Date(a.date_listed).getTime();
        case 'date_listed_old':
          return new Date(a.date_listed).getTime() - new Date(b.date_listed).getTime();
        case 'price_low':
          return (a.price_per_sqft * a.total_sqft) - (b.price_per_sqft * b.total_sqft);
        case 'price_high':
          return (b.price_per_sqft * b.total_sqft) - (a.price_per_sqft * a.total_sqft);
        case 'size_large':
          return b.total_sqft - a.total_sqft;
        case 'size_small':
          return a.total_sqft - b.total_sqft;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
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

  const handleSizeRangeChange = (index: number, value: number) => {
    setFilters(prev => ({
      ...prev,
      sizeRange: [
        index === 0 ? value : prev.sizeRange[0],
        index === 1 ? value : prev.sizeRange[1]
      ]
    }));
  };

  const handleLocationToggle = (location: string) => {
    setFilters(prev => ({
      ...prev,
      selectedLocations: prev.selectedLocations.includes(location)
        ? prev.selectedLocations.filter(l => l !== location)
        : [...prev.selectedLocations, location]
    }));
  };

  const handleLocationSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationSearchTerm(e.target.value);
  };

  const clearLocationSearch = () => {
    setLocationSearchTerm('');
  };

  const handleAmenitiesSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmenitiesSearchTerm(e.target.value);
  };

  const clearAmenitiesSearch = () => {
    setAmenitiesSearchTerm('');
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenity)
        ? prev.selectedAmenities.filter(a => a !== amenity)
        : [...prev.selectedAmenities, amenity]
    }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedTypes: [],
      priceRange: [minPrice, maxPrice],
      sizeRange: [minSize, maxSize],
      selectedLocations: [],
      selectedAmenities: [],
      sortBy: 'date_listed'
    });
    setLocationSearchTerm('');
    setAmenitiesSearchTerm('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search properties by title, description, location, or amenities..."
            value={filters.searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Filters Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
          <span className="font-medium">{isFiltersOpen ? 'Hide Filters' : 'Show Filters'}</span>
          <svg className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {(filters.searchTerm || filters.selectedTypes.length > 0 || filters.priceRange[0] !== minPrice || filters.priceRange[1] !== maxPrice || filters.sizeRange[0] !== minSize || filters.sizeRange[1] !== maxSize || filters.selectedLocations.length > 0 || filters.selectedAmenities.length > 0 || filters.sortBy !== 'date_listed') && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium self-start sm:self-auto"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {isFiltersOpen && (
        <div className="space-y-4 sm:space-y-6 border-t border-gray-200 pt-4 sm:pt-6">
          {/* Property Type Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Type</h3>
            <div className="relative" ref={typeRef}>
              <button
                onClick={() => setIsTypeOpen(!isTypeOpen)}
                className="w-full p-3 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <span className={filters.selectedTypes.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                  {filters.selectedTypes.length > 0 
                    ? filters.selectedTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1)).join(', ')
                    : 'Select property types'
                  }
                </span>
                <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isTypeOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {propertyTypes.map((type) => (
                    <label key={type} className="flex items-center space-x-2 p-3 hover:bg-gray-50 cursor-pointer">
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
              )}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Price Range: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
            </h3>
            <div className="space-y-4">
              <div className="px-2">
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  step="1000"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((filters.priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%, #e5e7eb ${((filters.priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  step="1000"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider mt-2"
                  style={{
                    background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${((filters.priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%, #3b82f6 ${((filters.priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%, #3b82f6 ${((filters.priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%, #e5e7eb ${((filters.priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatPrice(minPrice)}</span>
                <span>{formatPrice(maxPrice)}</span>
              </div>
            </div>
          </div>

          {/* Size Range Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Size Range: {formatNumber(filters.sizeRange[0])} - {formatNumber(filters.sizeRange[1])} sqft
            </h3>
            <div className="space-y-4">
              <div className="px-2">
                <input
                  type="range"
                  min={minSize}
                  max={maxSize}
                  step="100"
                  value={filters.sizeRange[0]}
                  onChange={(e) => handleSizeRangeChange(0, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((filters.sizeRange[0] - minSize) / (maxSize - minSize)) * 100}%, #e5e7eb ${((filters.sizeRange[0] - minSize) / (maxSize - minSize)) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <input
                  type="range"
                  min={minSize}
                  max={maxSize}
                  step="100"
                  value={filters.sizeRange[1]}
                  onChange={(e) => handleSizeRangeChange(1, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider mt-2"
                  style={{
                    background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${((filters.sizeRange[0] - minSize) / (maxSize - minSize)) * 100}%, #3b82f6 ${((filters.sizeRange[0] - minSize) / (maxSize - minSize)) * 100}%, #3b82f6 ${((filters.sizeRange[1] - minSize) / (maxSize - minSize)) * 100}%, #e5e7eb ${((filters.sizeRange[1] - minSize) / (maxSize - minSize)) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatNumber(minSize)} sqft</span>
                <span>{formatNumber(maxSize)} sqft</span>
              </div>
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Location</h3>
            <div className="relative" ref={locationRef}>
              <button
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="w-full p-3 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <span className={filters.selectedLocations.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                  {filters.selectedLocations.length > 0 
                    ? filters.selectedLocations.length > 2 
                      ? `${filters.selectedLocations.slice(0, 2).join(', ')} +${filters.selectedLocations.length - 2} more`
                      : filters.selectedLocations.join(', ')
                    : 'Select locations'
                  }
                </span>
                <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isLocationOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search locations..."
                        value={locationSearchTerm}
                        onChange={handleLocationSearchChange}
                        className="w-full p-2 pl-8 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {locationSearchTerm && (
                        <button
                          onClick={clearLocationSearch}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Location List */}
                  <div className="max-h-40 overflow-y-auto">
                    {locations.length > 0 ? (
                      locations.map((location) => (
                        <label key={location} className="flex items-center space-x-2 p-3 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.selectedLocations.includes(location)}
                            onChange={() => handleLocationToggle(location)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{location}</span>
                        </label>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        No locations found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amenities Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Amenities</h3>
            <div className="relative" ref={amenitiesRef}>
              <button
                onClick={() => setIsAmenitiesOpen(!isAmenitiesOpen)}
                className="w-full p-3 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <span className={filters.selectedAmenities.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                  {filters.selectedAmenities.length > 0 
                    ? filters.selectedAmenities.length > 2 
                      ? `${filters.selectedAmenities.slice(0, 2).join(', ')} +${filters.selectedAmenities.length - 2} more`
                      : filters.selectedAmenities.join(', ')
                    : 'Select amenities'
                  }
                </span>
                <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${isAmenitiesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isAmenitiesOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search amenities..."
                        value={amenitiesSearchTerm}
                        onChange={handleAmenitiesSearchChange}
                        className="w-full p-2 pl-8 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {amenitiesSearchTerm && (
                        <button
                          onClick={clearAmenitiesSearch}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Amenities List */}
                  <div className="max-h-40 overflow-y-auto">
                    {amenities.length > 0 ? (
                      amenities.map((amenity) => (
                        <label key={amenity} className="flex items-center space-x-2 p-3 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.selectedAmenities.includes(amenity)}
                            onChange={() => handleAmenityToggle(amenity)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{amenity}</span>
                        </label>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        No amenities found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sort By Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Sort By</h3>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;
