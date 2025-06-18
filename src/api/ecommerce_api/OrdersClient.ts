import { BaseApiClient, ApiResponse } from '../BaseApiClient';
import { Order, CreateOrderDto, UpdateOrderDto } from '../../types/ecommerce_types/order';
import { OrderStatus } from '../../types/common';

/**
 * Orders API client for managing order resources
 */
export class OrdersClient extends BaseApiClient {
  private readonly endpoint = '/orders';

  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderDto): Promise<ApiResponse<Order>> {
    this.logRequest('POST', this.endpoint, orderData);
    const response = await this.post<Order>(this.endpoint, orderData);
    this.logResponse(response);
    return response;
  }

  /**
   * Get all orders with optional user filter
   */
  async getAllOrders(userId?: string): Promise<ApiResponse<Order[]>> {
    const params = userId ? { userId } : undefined;
    this.logRequest('GET', this.endpoint);
    const response = await this.get<Order[]>(this.endpoint, { params });
    this.logResponse(response);
    return response;
  }

  /**
   * Get an order by ID
   */
  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    const url = `${this.endpoint}/${id}`;
    this.logRequest('GET', url);
    const response = await this.get<Order>(url);
    this.logResponse(response);
    return response;
  }

  /**
   * Update an order status
   */
  async updateOrder(id: string, orderData: UpdateOrderDto): Promise<ApiResponse<Order>> {
    const url = `${this.endpoint}/${id}`;
    this.logRequest('PATCH', url, orderData);
    const response = await this.patch<Order>(url, orderData);
    this.logResponse(response);
    return response;
  }

  /**
   * Cancel an order (delete)
   */
  async cancelOrder(id: string): Promise<ApiResponse<void>> {
    const url = `${this.endpoint}/${id}`;
    this.logRequest('DELETE', url);
    const response = await this.delete<void>(url);
    this.logResponse(response);
    return response;
  }

  /**
   * Get orders by user ID
   */
  async getOrdersByUser(userId: string): Promise<ApiResponse<Order[]>> {
    return this.getAllOrders(userId);
  }

  /**
   * Update order status specifically
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<ApiResponse<Order>> {
    return this.updateOrder(id, { status });
  }
}