import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { Product, CreateProductDto, UpdateProductDto } from '../../types/ecommerce_types/product';

const ajv = new Ajv();
addFormats(ajv);

/**
 * Product schema validation
 */
export const productSchema: JSONSchemaType<Product> = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string', minLength: 2 },
    description: { type: 'string' },
    price: { type: 'number', minimum: 0 },
    categoryId: { type: 'string' },
    stock: { type: 'number', minimum: 0 },
    imageUrl: { type: 'string', nullable: true },
    isActive: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name', 'description', 'price', 'categoryId', 'stock', 'isActive', 'createdAt', 'updatedAt'],
  additionalProperties: false
};

export const createProductSchema: JSONSchemaType<CreateProductDto> = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2 },
    description: { type: 'string' },
    price: { type: 'number', minimum: 0 },
    categoryId: { type: 'string' },
    stock: { type: 'number', minimum: 0 },
    imageUrl: { type: 'string', nullable: true },
    isActive: { type: 'boolean', nullable: true }
  },
  required: ['name', 'description', 'price', 'categoryId', 'stock'],
  additionalProperties: false
};

export const updateProductSchema: JSONSchemaType<UpdateProductDto> = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2, nullable: true },
    description: { type: 'string', nullable: true },
    price: { type: 'number', minimum: 0, nullable: true },
    categoryId: { type: 'string', nullable: true },
    stock: { type: 'number', minimum: 0, nullable: true },
    imageUrl: { type: 'string', nullable: true },
    isActive: { type: 'boolean', nullable: true }
  },
  required: [],
  additionalProperties: false
};

export const productListSchema: JSONSchemaType<Product[]> = {
  type: 'array',
  items: productSchema
};

// Compiled validators
export const validateProduct = ajv.compile(productSchema);
export const validateCreateProduct = ajv.compile(createProductSchema);
export const validateUpdateProduct = ajv.compile(updateProductSchema);
export const validateProductList = ajv.compile(productListSchema);

// Validation helper functions
export function isValidProduct(data: any): data is Product {
  return validateProduct(data);
}

export function isValidCreateProduct(data: any): data is CreateProductDto {
  return validateCreateProduct(data);
}

export function isValidUpdateProduct(data: any): data is UpdateProductDto {
  return validateUpdateProduct(data);
}

export function isValidProductList(data: any): data is Product[] {
  return validateProductList(data);
}

// Get validation errors
export function getProductValidationErrors(data: any): string[] {
  validateProduct(data);
  return validateProduct.errors?.map(err => `${err.instancePath} ${err.message}`) || [];
}