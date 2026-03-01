export interface ProductVariant {
  id?: number;
  variant_name: string;
  mrp?: number;
  price: number;
  stock: number;
  shipping_rate: number;
  image?: string;
  is_default: boolean;
}

export interface Product {
  id?: number;
  name: string;
  description: string;
  mrp?: number;
  price: number;
  stock: number;
  image: string;
  category: string;
  brand: string;
  shipping_rate: number;
  variants?: ProductVariant[];
  images?: string[];
}

export interface ProductFormData {
  name: string;
  description: string;
  mrp?: string;
  price: string;
  stock: string;
  image: string | File | null;
  images: (string | File)[]; // For additional images
  category: string;
  brand: string;
  shipping_rate: string;
  variants?: {
    variant_name: string;
    mrp?: string;
    price: string;
    stock: string;
    shipping_rate: string;
    image?: string | File | null;
    is_default: boolean;
  }[];
}

