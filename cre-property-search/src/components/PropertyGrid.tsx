import { useState, useEffect } from 'react';
import type { Property } from '../types/Property';
import PropertyCard from './PropertyCard';
import PropertyModal from './PropertyModal';
import CompareModal from './CompareModal';
import SearchAndFilters from './SearchAndFilters';

interface PropertyGridProps {
  properties: Property[];
}

const PropertyGrid = ({ properties }: PropertyGridProps) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) {
        if (next.size >= 4) return next; // enforce max 4
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  // Update filtered properties when properties change
  useEffect(() => {
    setFilteredProperties(properties);
  }, [properties]);

  // Safety check for properties array
  if (!properties || !Array.isArray(properties)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Properties Available</h2>
          <p className="text-gray-600">Unable to load property data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commercial Real Estate Properties
          </h1>
          <p className="text-gray-600">
            Discover {properties.length} premium commercial properties across various markets
          </p>
        </div>

        {/* Search and Filters */}
        <SearchAndFilters
          properties={properties}
          onFilteredProperties={setFilteredProperties}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{filteredProperties.length}</div>
            <div className="text-sm text-gray-600">Showing Properties</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {filteredProperties.filter(p => p.type === 'office').length}
            </div>
            <div className="text-sm text-gray-600">Office Spaces</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">
              {filteredProperties.filter(p => p.type === 'warehouse').length}
            </div>
            <div className="text-sm text-gray-600">Warehouses</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {filteredProperties.filter(p => p.type === 'retail').length}
            </div>
            <div className="text-sm text-gray-600">Retail Spaces</div>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              onClick={() => handlePropertyClick(property)}
              selected={selectedIds.has(property.id)}
              onToggleSelect={(checked) => toggleSelect(property.id, checked)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
        </div>
      </div>

      {/* Property Modal */}
      <PropertyModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Floating Compare Button */}
      {selectedIds.size >= 2 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsCompareOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-black px-5 py-3 rounded-full shadow-lg border border-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h6M3 12h9m-9 5h12" />
            </svg>
            <span className="font-medium">Compare ({selectedIds.size})</span>
          </button>
        </div>
      )}

      {/* Compare Modal */}
      <CompareModal
        properties={filteredProperties.filter(p => selectedIds.has(p.id)).slice(0, 4)}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onRemove={(id) => toggleSelect(id, false)}
      />
    </div>
  );
};

export default PropertyGrid;
