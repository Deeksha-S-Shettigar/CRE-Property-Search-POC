export interface Property {
  id: string;
  title: string;
  type: 'office' | 'retail' | 'industrial' | 'warehouse';
  price_per_sqft: number;
  total_sqft: number;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  images: string[];
  amenities: string[];
  date_listed: string;
  year_built?: number;
  description: string;
}
