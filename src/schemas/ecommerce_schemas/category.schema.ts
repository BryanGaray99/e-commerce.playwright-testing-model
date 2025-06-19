import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../types/ecommerce_types/category';

const ajv = new Ajv();
addFormats(ajv);

// Definir el esquema base para Category
const categoryBaseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string', minLength: 2 },
    description: { type: 'string' },
    parentId: { type: 'string' },
    isActive: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name', 'description', 'isActive', 'createdAt', 'updatedAt'],
  additionalProperties: false
};

/**
 * Category schema validation
 */
export const categorySchema = {
  ...categoryBaseSchema,
  properties: {
    ...categoryBaseSchema.properties,
    children: {
      type: 'array',
      items: categoryBaseSchema
    }
  }
} as const;

export const createCategorySchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2 },
    description: { type: 'string' },
    parentId: { type: 'string', nullable: true },
    isActive: { type: 'boolean' }
  },
  required: ['name', 'description'],
  additionalProperties: false
} as const;

export const updateCategorySchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2, nullable: true },
    description: { type: 'string', nullable: true },
    parentId: { type: 'string', nullable: true },
    isActive: { type: 'boolean', nullable: true }
  },
  required: [],
  additionalProperties: false
} as const;

export const categoryListSchema = {
  type: 'array',
  items: categorySchema
} as const;

// Compiled validators
export const validateCategory = ajv.compile(categorySchema);
export const validateCreateCategory = ajv.compile(createCategorySchema);
export const validateUpdateCategory = ajv.compile(updateCategorySchema);
export const validateCategoryList = ajv.compile(categoryListSchema);

// Validation helper functions
export function isValidCategory(data: any): data is Category {
  return validateCategory(data);
}

export function isValidCreateCategory(data: any): data is CreateCategoryDto {
  return validateCreateCategory(data);
}

export function isValidUpdateCategory(data: any): data is UpdateCategoryDto {
  return validateUpdateCategory(data);
}

export function isValidCategoryList(data: any): data is Category[] {
  return validateCategoryList(data);
}

// Get validation errors
export function getCategoryValidationErrors(data: any): string[] {
  validateCategory(data);
  return validateCategory.errors?.map(err => `${err.instancePath} ${err.message}`) || [];
}