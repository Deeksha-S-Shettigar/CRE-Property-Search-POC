import type { Property } from '../types/Property';
import PropertyImage from './PropertyImage';

interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

const PropertyModal = ({ property, isOpen, onClose }: PropertyModalProps) => {
  if (!isOpen || !property) return null;

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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-full flex items-center justify-center p-2 sm:p-4 lg:p-6">
        <div className="relative w-full max-w-6xl bg-white rounded-lg sm:rounded-xl shadow-2xl border border-gray-200">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="flex flex-col lg:flex-row p-4 sm:p-6">
            {/* Image Gallery */}
            <div className="lg:w-1/2 mb-6 lg:mb-0 lg:pr-6">
              <div className="relative h-64 sm:h-80 lg:h-96">
                <PropertyImage
                  src={property.images?.[0]}
                  alt={property.title}
                  propertyType={property.type}
                  className="w-full h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(property.type)}`}>
                    {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-sm font-semibold text-gray-800">
                    {formatPrice(property.price_per_sqft)}/sqft
                  </span>
                </div>
              </div>
              
              {/* Additional Images */}
              {property.images.length > 1 && (
                <div className="p-4 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">More Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {property.images.slice(1, 4).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${property.title} ${index + 2}`}
                        className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/200x150?text=Image';
                        }}
                      />
                    ))}
                    {property.images.length > 4 && (
                      <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm">
                        +{property.images.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="lg:w-1/2 p-6 overflow-y-auto max-h-96 lg:max-h-none">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  {property.address.street}, {property.address.city}, {property.address.state} {property.address.zip}
                </p>
              </div>

              {/* Price and Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {formatPrice(totalPrice)}
                  </div>
                  <div className="text-sm text-blue-800">Total Price</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                    {formatSqft(property.total_sqft)} sqft
                  </div>
                  <div className="text-sm text-green-800">Total Area</div>
                </div>
              </div>

              {/* Property Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Price per sqft</h4>
                  <p className="text-lg font-semibold text-gray-700">{formatPrice(property.price_per_sqft)}</p>
                </div>
                {property.year_built && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Year Built</h4>
                    <p className="text-lg font-semibold text-gray-700">{property.year_built}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Date Listed</h4>
                  <p className="text-lg font-semibold text-gray-700">
                    {new Date(property.date_listed).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Property Type</h4>
                  <p className="text-lg font-semibold text-gray-700 capitalize">{property.type}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Contact Agent
                </button>
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
                  Schedule Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyModal;
