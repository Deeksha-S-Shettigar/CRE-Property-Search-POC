import type { Property } from '../types/Property';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  selected?: boolean;
  onToggleSelect?: (checked: boolean) => void;
}

const PropertyCard = ({ property, onClick, selected = false, onToggleSelect }: PropertyCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatSqft = (sqft: number) => {
    return new Intl.NumberFormat('en-US').format(sqft);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'office':
        return 'bg-blue-100 text-blue-800';
      case 'retail':
        return 'bg-green-100 text-green-800';
      case 'industrial':
        return 'bg-orange-100 text-orange-800';
      case 'warehouse':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPrice = property.price_per_sqft * property.total_sqft;

  return (
    <div 
      className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer ${selected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        {/* Selection Checkbox */}
        <label className="absolute top-3 left-3 z-10 inline-flex items-center bg-white/90 backdrop-blur p-1 rounded-md shadow">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect && onToggleSelect(e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </label>
        <img
          src={property.images[0] || '/placeholder-property.jpg'}
          alt={property.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x300?text=Property+Image';
          }}
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(property.type)}`}>
            {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-sm font-semibold text-gray-800">
            {formatPrice(property.price_per_sqft)}/sqft
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title and Location */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {property.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {property.address.street}, {property.address.city}, {property.address.state} {property.address.zip}
        </p>

        {/* Price and Size */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(totalPrice)}
            </p>
            <p className="text-sm text-gray-500">Total Price</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              {formatSqft(property.total_sqft)} sqft
            </p>
            <p className="text-sm text-gray-500">Total Area</p>
          </div>
        </div>

        {/* Year Built */}
        {property.year_built && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Built in <span className="font-semibold">{property.year_built}</span>
            </p>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {property.description}
        </p>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Date Listed */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Listed: {new Date(property.date_listed).toLocaleDateString()}
          </p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm border border-blue-600"
            style={{ backgroundColor: '#2563eb', color: 'white' }}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
