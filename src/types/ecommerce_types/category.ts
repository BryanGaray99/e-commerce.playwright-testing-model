import { BaseEntity } from '../common';

/**
 * Category-related types and interfaces
 */

export interface Category extends BaseEntity {
  name: string;
  description: string;
  parentId?: string;
  isActive: boolean;
  children?: Category[];
}

export interface CreateCategoryDto {
  name: string;
  description: string;
  parentId?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface CategorySearchParams {
  parentId?: string;
  isActive?: boolean;
  includeChildren?: boolean;
}

export interface CategoryValidation {
  name: {
    minLength: 2;
    required: true;
  };
  description: {
    required: true;
  };
}