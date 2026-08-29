
export interface CategoryRef {
  _id: string;
  name: string;
  slug: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: {
    url: string | null;
    publicId: string | null;
  };
  isActive: boolean;
  productCount?: number;
}

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number | null;
  category: CategoryRef;
  brand: string;
  stock: number;
  sku?: string;
  images: ProductImage[];
  ratingsAverage: number;
  numReviews: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface ProductListResponse {
  count: number;
  total: number;
  page: number;
  totalPages: number;
  products: Product[];
}

export interface ProductFiltersMeta {
  brands: string[];
  minPrice: number;
  maxPrice: number;
}