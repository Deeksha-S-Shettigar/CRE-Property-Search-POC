import type { Property } from '../types/Property';
import PropertyImage from './PropertyImage';

interface CompareModalProps {
  properties: Property[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
}

const CompareModal = ({ properties, isOpen, onClose, onRemove }: CompareModalProps) => {
  if (!isOpen) return null;

  const formatPrice = (num: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  const totalPrice = (p: Property) => p.price_per_sqft * p.total_sqft;
  const age = (p: Property) => (p.year_built ? new Date().getFullYear() - p.year_built : null);

  // Determine best/worst for highlighting
  const bestPrice = Math.min(...properties.map(totalPrice)); // cheaper is better
  const bestSize = Math.max(...properties.map(p => p.total_sqft)); // bigger is better
  const bestAge = Math.min(...properties.map(p => (age(p) ?? Number.POSITIVE_INFINITY))); // newer (smaller age) is better

  const badge = (isBest: boolean) => isBest ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  // Determine layout based on number of properties
  const getLayoutConfig = () => {
    const count = properties.length;
    if (count <= 2) {
      return { 
        mobile: 'stack', 
        tablet: 'grid-2', 
        desktop: 'table' 
      };
    } else if (count <= 3) {
      return { 
        mobile: 'stack', 
        tablet: 'grid-3', 
        desktop: 'table' 
      };
    } else {
      return { 
        mobile: 'stack', 
        tablet: 'list', 
        desktop: 'table' 
      };
    }
  };

  const layoutConfig = getLayoutConfig();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-full flex items-center justify-center p-2 sm:p-4 lg:p-6">
        <div className="relative w-full max-w-7xl bg-white rounded-lg sm:rounded-xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Compare Properties</h2>
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {/* Mobile Layout - Stacked Cards */}
            <div className="block md:hidden space-y-4">
              {properties.map((property) => {
                const tp = totalPrice(property);
                const a = age(property);
                const isPriceBest = tp === bestPrice;
                const isSizeBest = property.total_sqft === bestSize;
                const isAgeBest = a !== null && a === bestAge;
                
                return (
                  <div key={property.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 break-words">{property.title}</h3>
                        <p className="text-xs text-gray-600 mt-1 truncate">{property.address.city}, {property.address.state}</p>
                      </div>
                      <button 
                        onClick={() => onRemove(property.id)} 
                        className="text-xs text-red-600 hover:text-red-700 flex-shrink-0 px-1"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="relative w-full h-28 mb-3 overflow-hidden rounded">
                      <PropertyImage
                        src={property.images?.[0]}
                        alt={property.title}
                        propertyType={property.type}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="min-w-0">
                        <div className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold mb-1 ${badge(isPriceBest)}`}>
                          {isPriceBest ? 'Best' : '—'}
                        </div>
                        <div className="text-xs font-semibold truncate">{formatPrice(tp)}</div>
                        <div className="text-xs text-gray-500 truncate">{formatPrice(property.price_per_sqft)}/sqft</div>
                      </div>
                      <div className="min-w-0">
                        <div className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold mb-1 ${badge(isSizeBest)}`}>
                          {isSizeBest ? 'Best' : '—'}
                        </div>
                        <div className="text-xs font-semibold truncate">{formatNumber(property.total_sqft)} sqft</div>
                      </div>
                      <div className="min-w-0">
                        <div className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold mb-1 ${isAgeBest ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {isAgeBest ? 'Newest' : '—'}
                        </div>
                        <div className="text-xs font-semibold truncate">{a !== null ? `${a} yrs` : 'N/A'}</div>
                        {property.year_built && <div className="text-xs text-gray-500 truncate">{property.year_built}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tablet Layout - Dynamic Grid/List */}
            <div className="hidden sm:block md:hidden">
              {layoutConfig.tablet === 'list' ? (
                // List view for 4+ properties
                <div className="space-y-4">
                  {properties.map((property) => {
                    const tp = totalPrice(property);
                    const a = age(property);
                    const isPriceBest = tp === bestPrice;
                    const isSizeBest = property.total_sqft === bestSize;
                    const isAgeBest = a !== null && a === bestAge;
                    
                    return (
                      <div key={property.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start gap-4">
                          <div className="relative w-24 h-20 flex-shrink-0 overflow-hidden rounded">
                            <PropertyImage
                              src={property.images?.[0]}
                              alt={property.title}
                              propertyType={property.type}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 break-words">{property.title}</h3>
                                <p className="text-xs text-gray-600 mt-1 truncate">{property.address.city}, {property.address.state}</p>
                              </div>
                              <button 
                                onClick={() => onRemove(property.id)} 
                                className="text-xs text-red-600 hover:text-red-700 flex-shrink-0 ml-2"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-center">
                              <div className="min-w-0">
                                <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-1 ${badge(isPriceBest)}`}>
                                  {isPriceBest ? 'Best' : '—'}
                                </div>
                                <div className="text-xs font-semibold truncate">{formatPrice(tp)}</div>
                                <div className="text-xs text-gray-500 truncate">{formatPrice(property.price_per_sqft)}/sqft</div>
                              </div>
                              <div className="min-w-0">
                                <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-1 ${badge(isSizeBest)}`}>
                                  {isSizeBest ? 'Best' : '—'}
                                </div>
                                <div className="text-xs font-semibold truncate">{formatNumber(property.total_sqft)} sqft</div>
                              </div>
                              <div className="min-w-0">
                                <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-1 ${isAgeBest ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {isAgeBest ? 'Newest' : '—'}
                                </div>
                                <div className="text-xs font-semibold truncate">{a !== null ? `${a} yrs` : 'N/A'}</div>
                                {property.year_built && <div className="text-xs text-gray-500 truncate">{property.year_built}</div>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Grid view for 2-3 properties
                <div className={`grid gap-4 ${layoutConfig.tablet === 'grid-2' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'}`}>
                  {properties.map((property) => {
                    const tp = totalPrice(property);
                    const a = age(property);
                    const isPriceBest = tp === bestPrice;
                    const isSizeBest = property.total_sqft === bestSize;
                    const isAgeBest = a !== null && a === bestAge;
                    
                    return (
                      <div key={property.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 break-words">{property.title}</h3>
                            <p className="text-xs text-gray-600 mt-1 truncate">{property.address.city}, {property.address.state}</p>
                          </div>
                          <button 
                            onClick={() => onRemove(property.id)} 
                            className="text-xs text-red-600 hover:text-red-700 flex-shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className="relative w-full h-32 mb-3 overflow-hidden rounded">
                          <PropertyImage
                            src={property.images?.[0]}
                            alt={property.title}
                            propertyType={property.type}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="min-w-0">
                            <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-1 ${badge(isPriceBest)}`}>
                              {isPriceBest ? 'Best' : '—'}
                            </div>
                            <div className="text-xs font-semibold truncate">{formatPrice(tp)}</div>
                            <div className="text-xs text-gray-500 truncate">{formatPrice(property.price_per_sqft)}/sqft</div>
                          </div>
                          <div className="min-w-0">
                            <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-1 ${badge(isSizeBest)}`}>
                              {isSizeBest ? 'Best' : '—'}
                            </div>
                            <div className="text-xs font-semibold truncate">{formatNumber(property.total_sqft)} sqft</div>
                          </div>
                          <div className="min-w-0">
                            <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-1 ${isAgeBest ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {isAgeBest ? 'Newest' : '—'}
                            </div>
                            <div className="text-xs font-semibold truncate">{a !== null ? `${a} yrs` : 'N/A'}</div>
                            {property.year_built && <div className="text-xs text-gray-500 truncate">{property.year_built}</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop Layout - Adaptive Table */}
            <div className="hidden md:block">
              {properties.length <= 3 ? (
                // Compact table for 1-3 properties
                <div className="grid gap-6" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
                  {/* Header column */}
                  <div />
                  {properties.map(p => (
                    <div key={p.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 break-words">{p.title}</h3>
                        <button onClick={() => onRemove(p.id)} className="text-xs text-red-600 hover:text-red-700 flex-shrink-0">Remove</button>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 truncate">{p.address.city}, {p.address.state}</p>
                      <div className="relative w-full h-24 overflow-hidden rounded">
                        <PropertyImage
                          src={p.images?.[0]}
                          alt={p.title}
                          propertyType={p.type}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Price row */}
                  <div className="px-4 py-4 border-t font-semibold text-gray-800 text-sm">Total Price</div>
                  {properties.map(p => {
                    const tp = totalPrice(p);
                    const isBest = tp === bestPrice;
                    return (
                      <div key={p.id} className="px-4 py-4 border-t">
                        <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${badge(isBest)}`}>{isBest ? 'Best' : 'Higher'}</div>
                        <div className="text-lg font-bold">{formatPrice(tp)}</div>
                        <div className="text-xs text-gray-500 mt-1">{formatPrice(p.price_per_sqft)}/sqft</div>
                      </div>
                    );
                  })}

                  {/* Size row */}
                  <div className="px-4 py-4 border-t font-semibold text-gray-800 text-sm">Size</div>
                  {properties.map(p => {
                    const isBest = p.total_sqft === bestSize;
                    return (
                      <div key={p.id} className="px-4 py-4 border-t">
                        <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${badge(isBest)}`}>{isBest ? 'Largest' : 'Smaller'}</div>
                        <div className="text-lg font-bold">{formatNumber(p.total_sqft)} sqft</div>
                      </div>
                    );
                  })}

                  {/* Age row */}
                  <div className="px-4 py-4 border-t font-semibold text-gray-800 text-sm">Age</div>
                  {properties.map(p => {
                    const a = age(p);
                    const isBest = a !== null && a === bestAge;
                    return (
                      <div key={p.id} className="px-4 py-4 border-t">
                        <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${isBest ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{isBest ? 'Newest' : 'Older'}</div>
                        <div className="text-lg font-bold">{a !== null ? `${a} yrs` : 'N/A'}</div>
                        {p.year_built && <div className="text-xs text-gray-500 mt-1">Built {p.year_built}</div>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Scrollable table for 4+ properties
                <div className="overflow-x-auto">
                  <div className="min-w-[800px] grid" style={{ gridTemplateColumns: `180px repeat(${properties.length}, minmax(180px, 1fr))` }}>
                    {/* Header column */}
                    <div />
                    {properties.map(p => (
                      <div key={p.id} className="px-3 py-3">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2 break-words">{p.title}</h3>
                          <button onClick={() => onRemove(p.id)} className="text-xs text-red-600 hover:text-red-700 flex-shrink-0">Remove</button>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 truncate">{p.address.city}, {p.address.state}</p>
                        <div className="relative w-full h-20 overflow-hidden rounded">
                          <PropertyImage
                            src={p.images?.[0]}
                            alt={p.title}
                            propertyType={p.type}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ))}

                    {/* Price row */}
                    <div className="px-3 py-4 border-t font-semibold text-gray-800 text-xs">Total Price</div>
                    {properties.map(p => {
                      const tp = totalPrice(p);
                      const isBest = tp === bestPrice;
                      return (
                        <div key={p.id} className="px-3 py-4 border-t">
                          <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${badge(isBest)}`}>{isBest ? 'Best' : 'Higher'}</div>
                          <div className="text-sm font-bold">{formatPrice(tp)}</div>
                          <div className="text-xs text-gray-500 mt-1">{formatPrice(p.price_per_sqft)}/sqft</div>
                        </div>
                      );
                    })}

                    {/* Size row */}
                    <div className="px-3 py-4 border-t font-semibold text-gray-800 text-xs">Size</div>
                    {properties.map(p => {
                      const isBest = p.total_sqft === bestSize;
                      return (
                        <div key={p.id} className="px-3 py-4 border-t">
                          <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${badge(isBest)}`}>{isBest ? 'Largest' : 'Smaller'}</div>
                          <div className="text-sm font-bold">{formatNumber(p.total_sqft)} sqft</div>
                        </div>
                      );
                    })}

                    {/* Age row */}
                    <div className="px-3 py-4 border-t font-semibold text-gray-800 text-xs">Age</div>
                    {properties.map(p => {
                      const a = age(p);
                      const isBest = a !== null && a === bestAge;
                      return (
                        <div key={p.id} className="px-3 py-4 border-t">
                          <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${isBest ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{isBest ? 'Newest' : 'Older'}</div>
                          <div className="text-sm font-bold">{a !== null ? `${a} yrs` : 'N/A'}</div>
                          {p.year_built && <div className="text-xs text-gray-500 mt-1">Built {p.year_built}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">Select 2–4 properties to compare.</p>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
