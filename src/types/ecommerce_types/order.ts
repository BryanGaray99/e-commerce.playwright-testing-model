import { BaseEntity, Address, OrderStatus } from '../common';

/**
 * Order-related types and interfaces
 */

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order extends BaseEntity {
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: Address;
}

export interface OrderItemDto {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  userId: string;
  items: OrderItemDto[];
  shippingAddress: Address;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
}

export interface OrderSearchParams {
  userId?: string;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}

export interface OrderValidation {
  userId: {
    required: true;
  };
  items: {
    minItems: 1;
    required: true;
  };
  'items.*.quantity': {
    minimum: 1;
    required: true;
  };
  'items.*.price': {
    minimum: 0;
    required: true;
  };
}