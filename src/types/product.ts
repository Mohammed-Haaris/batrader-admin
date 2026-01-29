export interface ProductVariant {
  id?: number;
  variant_name: string;
  price: number;
  stock: number;
  shipping_rate: number;
  is_default: boolean;
}

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  brand: string;
  shipping_rate: number;
  variants?: ProductVariant[];
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  image: string | File | null;
  category: string;
  brand: string;
  shipping_rate: string;
  variants?: {
    variant_name: string;
    price: string;
    stock: string;
    shipping_rate: string;
    is_default: boolean;
  }[];
}
