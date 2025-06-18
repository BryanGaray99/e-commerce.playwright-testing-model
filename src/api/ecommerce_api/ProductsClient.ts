import { BaseApiClient, ApiResponse } from '../BaseApiClient';
import { Product, CreateProductDto, UpdateProductDto } from '../../types/ecommerce_types/product';

/**
 * Products API client for managing product resources
 */
export class ProductsClient extends BaseApiClient {
  private readonly endpoint = '/products';

  /**
   * Create a new product
   */
  async createProduct(productData: CreateProductDto): Promise<ApiResponse<Product>> {
    this.logRequest('POST', this.endpoint, productData);
    const response = await this.post<Product>(this.endpoint, productData);
    this.logResponse(response);
    return response;
  }

  /**
   * Get all products with optional category filter
   */
  async getAllProducts(categoryId?: string): Promise<ApiResponse<Product[]>> {
    const params = categoryId ? { category: categoryId } : undefined;
    this.logRequest('GET', this.endpoint);
    const response = await this.get<Product[]>(this.endpoint, { params });
    this.logResponse(response);
    return response;
  }

  /**
   * Get a product by ID
   */
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    const url = `${this.endpoint}/${id}`;
    this.logRequest('GET', url);
    const response = await this.get<Product>(url);
    this.logResponse(response);
    return response;
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, productData: UpdateProductDto): Promise<ApiResponse<Product>> {
    const url = `${this.endpoint}/${id}`;
    this.logRequest('PATCH', url, productData);
    const response = await this.patch<Product>(url, productData);
    this.logResponse(response);
    return response;
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    const url = `${this.endpoint}/${id}`;
    this.logRequest('DELETE', url);
    const response = await this.delete<void>(url);
    this.logResponse(response);
    return response;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string): Promise<ApiResponse<Product[]>> {
    return this.getAllProducts(categoryId);
  }

  /**
   * Search products (if endpoint supports it)
   */
  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    const params = { q: query };
    this.logRequest('GET', this.endpoint);
    const response = await this.get<Product[]>(this.endpoint, { params });
    this.logResponse(response);
    return response;
  }
}