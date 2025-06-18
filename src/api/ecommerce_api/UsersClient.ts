import { BaseApiClient, ApiResponse } from '../BaseApiClient';
import { User, CreateUserDto, UpdateUserDto } from '../../types/ecommerce_types/user';

/**
 * Users API client for managing user resources
 */
export class UsersClient extends BaseApiClient {
  private readonly endpoint = '/users';

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserDto): Promise<ApiResponse<User>> {
    this.logRequest('POST', this.endpoint, userData);
    const response = await this.post<User>(this.endpoint, userData);
    this.logResponse(response);
    return response;
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    this.logRequest('GET', this.endpoint);
    const response = await this.get<User[]>(this.endpoint);
    this.logResponse(response);
    return response;
  }

  /**
   * Get a user by ID
   */
  async getUserById(id: string): Promise<ApiResponse<User>> {
    const url = `${this.endpoint}/${id}`;
    this.logRequest('GET', url);
    const response = await this.get<User>(url);
    this.logResponse(response);
    return response;
  }

  /**
   * Update a user
   */
  async updateUser(id: string, userData: UpdateUserDto): Promise<ApiResponse<User>> {
    const url = `${this.endpoint}/${id}`;
    this.logRequest('PATCH', url, userData);
    const response = await this.patch<User>(url, userData);
    this.logResponse(response);
    return response;
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const url = `${this.endpoint}/${id}`;
    this.logRequest('DELETE', url);
    const response = await this.delete<void>(url);
    this.logResponse(response);
    return response;
  }

  /**
   * Get user by email (if endpoint supports it)
   */
  async getUserByEmail(email: string): Promise<ApiResponse<User>> {
    const params = { email };
    this.logRequest('GET', this.endpoint);
    const response = await this.get<User>(this.endpoint, { params });
    this.logResponse(response);
    return response;
  }
}