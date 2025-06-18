import { BaseEntity } from '../common';

/**
 * Cart-related types and interfaces
 */

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Cart extends BaseEntity {
  userId: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}

export interface AddItemDto {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface UpdateItemDto {
  quantity: number;
}

export interface CartValidation {
  productId: {
    required: true;
  };
  quantity: {
    minimum: 1;
    required: true;
  };
  price: {
    minimum: 0;
    required: true;
  };
}