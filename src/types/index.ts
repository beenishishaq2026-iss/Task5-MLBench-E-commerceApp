
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


export interface OrderItem {
  product: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  _id: string;
  user: { _id: string; name: string; email: string } | string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  itemsPrice: number;
  totalPrice: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  isPaid: boolean;
  paidAt?: string;
  paymentMethod: string;
  createdAt: string;
}