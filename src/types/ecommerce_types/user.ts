import { BaseEntity, Address } from '../common';

/**
 * User-related types and interfaces
 */

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address: Address;
  isActive: boolean;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address: Address;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: Address;
  isActive?: boolean;
}

export interface UserSearchParams {
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface UserValidation {
  email: {
    format: 'email';
    required: true;
  };
  firstName: {
    minLength: 1;
    required: true;
  };
  lastName: {
    minLength: 1;
    required: true;
  };
}