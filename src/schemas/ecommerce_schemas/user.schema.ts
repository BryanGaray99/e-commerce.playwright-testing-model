import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { User, CreateUserDto, UpdateUserDto } from '../../types/ecommerce_types/user';
import { Address } from '../../types/common';

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
 * User schema validation
 */
export const userSchema: JSONSchemaType<User> = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string', format: 'email' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    phone: { type: 'string', nullable: true },
    address: addressSchema,
    isActive: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'email', 'firstName', 'lastName', 'address', 'isActive', 'createdAt', 'updatedAt'],
  additionalProperties: false
};

export const createUserSchema: JSONSchemaType<CreateUserDto> = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    phone: { type: 'string', nullable: true },
    address: addressSchema
  },
  required: ['email', 'firstName', 'lastName', 'address'],
  additionalProperties: false
};

export const updateUserSchema: JSONSchemaType<UpdateUserDto> = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', nullable: true },
    firstName: { type: 'string', nullable: true },
    lastName: { type: 'string', nullable: true },
    phone: { type: 'string', nullable: true },
    address: { ...addressSchema, nullable: true },
    isActive: { type: 'boolean', nullable: true }
  },
  required: [],
  additionalProperties: false
};

export const userListSchema: JSONSchemaType<User[]> = {
  type: 'array',
  items: userSchema
};

// Compiled validators
export const validateUser = ajv.compile(userSchema);
export const validateCreateUser = ajv.compile(createUserSchema);
export const validateUpdateUser = ajv.compile(updateUserSchema);
export const validateUserList = ajv.compile(userListSchema);

// Validation helper functions
export function isValidUser(data: any): data is User {
  return validateUser(data);
}

export function isValidCreateUser(data: any): data is CreateUserDto {
  return validateCreateUser(data);
}

export function isValidUpdateUser(data: any): data is UpdateUserDto {
  return validateUpdateUser(data);
}

export function isValidUserList(data: any): data is User[] {
  return validateUserList(data);
}

// Get validation errors
export function getUserValidationErrors(data: any): string[] {
  validateUser(data);
  return validateUser.errors?.map(err => `${err.instancePath} ${err.message}`) || [];
}