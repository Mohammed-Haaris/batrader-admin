/** @format */

import axios from "axios";
import type { Product } from "../types/product";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const productAPI = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    const response = await axios.get(`${API_BASE_URL}/products`);
    return response.data.data;
  },

  // Get single product by ID
  getProductById: async (id: number): Promise<Product> => {
    const response = await axios.get(`${API_BASE_URL}/product/${id}`);
    return response.data.data;
  },

  // Create new product
  createProduct: async (product: FormData | Omit<Product, "id">): Promise<Product> => {
    const response = await axios.post(
      `${API_BASE_URL}/create/product`,
      product
    );
    return response.data.data;
  },

  // Update product
  updateProduct: async (
    id: number,
    product: FormData | Omit<Product, "id">
  ): Promise<Product> => {
    const response = await axios.put(
      `${API_BASE_URL}/update/product/${id}`,
      product
    );
    return response.data.data;
  },

  // Delete product
  deleteProduct: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/delete/product/${id}`);
  },
};
