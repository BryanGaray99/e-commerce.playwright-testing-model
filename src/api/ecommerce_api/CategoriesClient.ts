import { BaseApiClient, ApiResponse } from '../BaseApiClient';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../types/ecommerce_types/category';

/**
 * Categories API client for managing category resources
 */
export class CategoriesClient extends BaseApiClient {
  private readonly endpoint = '/categories';

  /**
   * Create a new category
   */
  async createCategory(categoryData: CreateCategoryDto): Promise<ApiResponse<Category>> {
    this.logRequest('POST', this.endpoint, categoryData);
    const response = await this.post<Category>(this.endpoint, categoryData);
    this.logResponse(response);
    return response;
  }

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    this.logRequest('GET', this.endpoint);
    const response = await this.get<Category[]>(this.endpoint);
    this.logResponse(response);
    return response;
  }

  /**
   * Get a category by ID
   */
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    const url = `${this.endpoint}/${id}`;
    this.logRequest('GET', url);
    const response = await this.get<Category>(url);
    this.logResponse(response);
    return response;
  }

  /**
   * Update a category
   */
  async updateCategory(id: string, categoryData: UpdateCategoryDto): Promise<ApiResponse<Category>> {
    const url = `${this.endpoint}/${id}`;
    this.logRequest('PATCH', url, categoryData);
    const response = await this.patch<Category>(url, categoryData);
    this.logResponse(response);
    return response;
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    const url = `${this.endpoint}/${id}`;
    this.logRequest('DELETE', url);
    const response = await this.delete<void>(url);
    this.logResponse(response);
    return response;
  }

  /**
   * Get child categories
   */
  async getChildCategories(parentId: string): Promise<ApiResponse<Category[]>> {
    const params = { parentId };
    this.logRequest('GET', this.endpoint);
    const response = await this.get<Category[]>(this.endpoint, { params });
    this.logResponse(response);
    return response;
  }

  /**
   * Get root categories (no parent)
   */
  async getRootCategories(): Promise<ApiResponse<Category[]>> {
    const params = { parentId: 'null' };
    this.logRequest('GET', this.endpoint);
    const response = await this.get<Category[]>(this.endpoint, { params });
    this.logResponse(response);
    return response;
  }
}