import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { Order, CreateOrderDto, UpdateOrderDto, OrderItem, OrderItemDto } from '../../types/ecommerce_types/order';
import { Address, OrderStatus } from '../../types/common';

const ajv = new Ajv();
addFormats(ajv);

/**
 * Address schema
 */
const addressSchema: JSONSchemaType<Address> = {
  type: 'object',
  properties: {
    street: { type: 'string' },
    city: { type: 'string' },
    state: { type: 'string' },
    zipCode: { type: 'string' },
    country: { type: 'string' }
  },
  required: ['street', 'city', 'state', 'zipCode', 'country'],
  additionalProperties: false
};

/**
 * Order item schemas
 */
const orderItemSchema: JSONSchemaType<OrderItem> = {
  type: 'object',
  properties: {
    productId: { type: 'string' },
    productName: { type: 'string' },
    quantity: { type: 'number', minimum: 1 },
    price: { type: 'number', minimum: 0 }
  },
  required: ['productId', 'productName', 'quantity', 'price'],
  additionalProperties: false
};

const orderItemDtoSchema: JSONSchemaType<OrderItemDto> = {
  type: 'object',
  properties: {
    productId: { type: 'string' },
    productName: { type: 'string' },
    quantity: { type: 'number', minimum: 1 },
    price: { type: 'number', minimum: 0 }
  },
  required: ['productId', 'productName', 'quantity', 'price'],
  additionalProperties: false
};

/**
 * Order schema validation
 */
export const orderSchema: JSONSchemaType<Order> = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    items: {
      type: 'array',
      items: orderItemSchema,
      minItems: 1
    },
    status: {
      type: 'string',
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    },
    totalAmount: { type: 'number', minimum: 0 },
    shippingAddress: addressSchema,
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'userId', 'items', 'status', 'totalAmount', 'shippingAddress', 'createdAt', 'updatedAt'],
  additionalProperties: false
};

export const createOrderSchema: JSONSchemaType<CreateOrderDto> = {
  type: 'object',
  properties: {
    userId: { type: 'string' },
    items: {
      type: 'array',
      items: orderItemDtoSchema,
      minItems: 1
    },
    shippingAddress: addressSchema
  },
  required: ['userId', 'items', 'shippingAddress'],
  additionalProperties: false
};

export const updateOrderSchema: JSONSchemaType<UpdateOrderDto> = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      nullable: true
    }
  },
  required: [],
  additionalProperties: false
};

export const orderListSchema: JSONSchemaType<Order[]> = {
  type: 'array',
  items: orderSchema
};

// Compiled validators
export const validateOrder = ajv.compile(orderSchema);
export const validateCreateOrder = ajv.compile(createOrderSchema);
export const validateUpdateOrder = ajv.compile(updateOrderSchema);
export const validateOrderList = ajv.compile(orderListSchema);

// Validation helper functions
export function isValidOrder(data: any): data is Order {
  return validateOrder(data);
}

export function isValidCreateOrder(data: any): data is CreateOrderDto {
  return validateCreateOrder(data);
}

export function isValidUpdateOrder(data: any): data is UpdateOrderDto {
  return validateUpdateOrder(data);
}

export function isValidOrderList(data: any): data is Order[] {
  return validateOrderList(data);
}

// Get validation errors
export function getOrderValidationErrors(data: any): string[] {
  validateOrder(data);
  return validateOrder.errors?.map(err => `${err.instancePath} ${err.message}`) || [];
}