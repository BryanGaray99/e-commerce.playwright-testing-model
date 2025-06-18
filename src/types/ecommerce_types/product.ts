import { BaseEntity } from '../common';

/**
 * Product-related types and interfaces
 */

export interface Product extends BaseEntity {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  stock?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface ProductSearchParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
  q?: string; // search query
}

export interface ProductValidation {
  name: {
    minLength: 2;
    required: true;
  };
  price: {
    minimum: 0;
    required: true;
  };
  stock: {
    minimum: 0;
    required: true;
  };
}