import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { Cart, CartItem, AddItemDto, UpdateItemDto } from '../../types/ecommerce_types/cart';

const ajv = new Ajv();
addFormats(ajv);

/**
 * Cart item schema
 */
const cartItemSchema: JSONSchemaType<CartItem> = {
  type: 'object',
  properties: {
    productId: { type: 'string' },
    productName: { type: 'string' },
    price: { type: 'number', minimum: 0 },
    quantity: { type: 'number', minimum: 1 },
    total: { type: 'number', minimum: 0 }
  },
  required: ['productId', 'productName', 'price', 'quantity', 'total'],
  additionalProperties: false
};

/**
 * Cart schema validation
 */
export const cartSchema: JSONSchemaType<Cart> = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    items: {
      type: 'array',
      items: cartItemSchema
    },
    totalAmount: { type: 'number', minimum: 0 },
    itemCount: { type: 'number', minimum: 0 },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'userId', 'items', 'totalAmount', 'itemCount', 'createdAt', 'updatedAt'],
  additionalProperties: false
};

export const addItemSchema: JSONSchemaType<AddItemDto> = {
  type: 'object',
  properties: {
    productId: { type: 'string' },
    productName: { type: 'string' },
    price: { type: 'number', minimum: 0 },
    quantity: { type: 'number', minimum: 1 }
  },
  required: ['productId', 'productName', 'price', 'quantity'],
  additionalProperties: false
};

export const updateItemSchema: JSONSchemaType<UpdateItemDto> = {
  type: 'object',
  properties: {
    quantity: { type: 'number', minimum: 1 }
  },
  required: ['quantity'],
  additionalProperties: false
};

// Compiled validators
export const validateCart = ajv.compile(cartSchema);
export const validateAddItem = ajv.compile(addItemSchema);
export const validateUpdateItem = ajv.compile(updateItemSchema);
export const validateCartItem = ajv.compile(cartItemSchema);

// Validation helper functions
export function isValidCart(data: any): data is Cart {
  return validateCart(data);
}

export function isValidAddItem(data: any): data is AddItemDto {
  return validateAddItem(data);
}

export function isValidUpdateItem(data: any): data is UpdateItemDto {
  return validateUpdateItem(data);
}

export function isValidCartItem(data: any): data is CartItem {
  return validateCartItem(data);
}

// Get validation errors
export function getCartValidationErrors(data: any): string[] {
  validateCart(data);
  return validateCart.errors?.map(err => `${err.instancePath} ${err.message}`) || [];
}