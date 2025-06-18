import { BaseApiClient, ApiResponse } from '../BaseApiClient';
import { Cart, CartItem, AddItemDto, UpdateItemDto } from '../../types/ecommerce_types/cart';

/**
 * Cart API client for managing shopping cart resources
 */
export class CartClient extends BaseApiClient {
  private readonly endpoint = '/cart';

  /**
   * Get user cart
   */
  async getCart(userId: string): Promise<ApiResponse<Cart>> {
    const url = `${this.endpoint}/${userId}`;
    this.logRequest('GET', url);
    const response = await this.get<Cart>(url);
    this.logResponse(response);
    return response;
  }

  /**
   * Clear user cart
   */
  async clearCart(userId: string): Promise<ApiResponse<void>> {
    const url = `${this.endpoint}/${userId}`;
    this.logRequest('DELETE', url);
    const response = await this.delete<void>(url);
    this.logResponse(response);
    return response;
  }

  /**
   * Add item to cart
   */
  async addItem(userId: string, itemData: AddItemDto): Promise<ApiResponse<CartItem>> {
    const url = `${this.endpoint}/${userId}/items`;
    this.logRequest('POST', url, itemData);
    const response = await this.post<CartItem>(url, itemData);
    this.logResponse(response);
    return response;
  }

  /**
   * Update item quantity in cart
   */
  async updateItem(userId: string, productId: string, itemData: UpdateItemDto): Promise<ApiResponse<CartItem>> {
    const url = `${this.endpoint}/${userId}/items/${productId}`;
    this.logRequest('PATCH', url, itemData);
    const response = await this.patch<CartItem>(url, itemData);
    this.logResponse(response);
    return response;
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, productId: string): Promise<ApiResponse<void>> {
    const url = `${this.endpoint}/${userId}/items/${productId}`;
    this.logRequest('DELETE', url);
    const response = await this.delete<void>(url);
    this.logResponse(response);
    return response;
  }

  /**
   * Get cart total
   */
  async getCartTotal(userId: string): Promise<ApiResponse<{ total: number; itemCount: number }>> {
    const cartResponse = await this.getCart(userId);
    
    if (cartResponse.status === 200 && cartResponse.data) {
      const cart = cartResponse.data;
      const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        status: 200,
        data: { total, itemCount },
        headers: cartResponse.headers,
        url: cartResponse.url
      };
    }
    
    return cartResponse as any;
  }
}