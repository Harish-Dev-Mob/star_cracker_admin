// ─── Product Types ───────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: ProductCategory;
  images: string[];
  stock: number;
  weight?: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory =
  | "sparklers"
  | "rockets"
  | "fountains"
  | "ground-spinners"
  | "aerial-shells"
  | "novelties"
  | "combo-packs";

// ─── Cart Types ───────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// ─── Order Types ──────────────────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  items: CartItem[];
  status: OrderStatus;
  total: number;
  customer: Customer;
  createdAt: string;
}

// ─── Customer Types ───────────────────────────────────────────────────────────
export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// ─── API Types ────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
