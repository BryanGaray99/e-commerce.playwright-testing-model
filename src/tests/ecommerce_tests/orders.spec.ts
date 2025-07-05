import { test, expect } from '@playwright/test';
import { OrdersClient } from '../../api/ecommerce_api/OrdersClient';
import { UsersClient } from '../../api/ecommerce_api/UsersClient';
import { OrderFixture } from '../../fixtures/ecommerce_fixtures/order.fixture';
import { UserFixture } from '../../fixtures/ecommerce_fixtures/user.fixture';
import { isValidOrder, isValidOrderList } from '../../schemas/ecommerce_schemas/order.schema';

test.describe('Orders API', () => {
  let ordersClient: OrdersClient;
  let usersClient: UsersClient;
  let createdOrderIds: string[] = [];
  let createdUserIds: string[] = [];
  let testUserId: string;

  test.beforeAll(async () => {
    ordersClient = new OrdersClient();
    usersClient = new UsersClient();
    await Promise.all([ordersClient.init(), usersClient.init()]);
    
    // Create a test user for orders
    const userData = UserFixture.createUserDto();
    const userResponse = await usersClient.createUser(userData);
    testUserId = userResponse.data.id;
    createdUserIds.push(testUserId);
  });

  test.afterAll(async () => {
    // Cleanup created orders
    for (const orderId of createdOrderIds) {
      try {
        await ordersClient.cancelOrder(orderId);
      } catch (error) {
        console.warn(`Failed to cleanup order ${orderId}:`, error);
      }
    }
    
    // Cleanup created users
    for (const userId of createdUserIds) {
      try {
        await usersClient.deleteUser(userId);
      } catch (error) {
        console.warn(`Failed to cleanup user ${userId}:`, error);
      }
    }
    
    await Promise.all([ordersClient.dispose(), usersClient.dispose()]);
  });

  test.describe('Create Order', () => {
    test('should create an order successfully', async () => {
      const orderData = OrderFixture.createOrderDto({ userId: testUserId });
      
      const response = await ordersClient.createOrder(orderData);
      
      expect(response.status).toBe(201);
      expect(response.data).toBeTruthy();
      expect(response.data.id).toBeTruthy();
      expect(isValidOrder(response.data)).toBe(true);
      
      createdOrderIds.push(response.data.id);
    });

    test('should fail to create order without items', async () => {
      const invalidData = OrderFixture.createInvalidOrder().withoutItems;
      
      try {
        await ordersClient.createOrder(invalidData);
        throw new Error('Should have thrown an error');
      } catch (error: any) {
        expect(error.status || error.response?.status).toBe(400);
      }
    });
  });

  test.describe('Get Orders', () => {
    test('should get all orders', async () => {
      const response = await ordersClient.getAllOrders();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(isValidOrderList(response.data)).toBe(true);
    });

    test('should get orders by user ID', async () => {
      const response = await ordersClient.getOrdersByUser(testUserId);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // All orders should belong to the test user
      response.data.forEach((order: any) => {
        expect(order.userId).toBe(testUserId);
      });
    });

    test('should get order by ID', async () => {
      // Create an order first
      const orderData = OrderFixture.createOrderDto({ userId: testUserId });
      const createResponse = await ordersClient.createOrder(orderData);
      createdOrderIds.push(createResponse.data.id);
      
      const response = await ordersClient.getOrderById(createResponse.data.id);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(createResponse.data.id);
      expect(isValidOrder(response.data)).toBe(true);
    });
  });

  test.describe('Update Order', () => {
    test('should update order status successfully', async () => {
      // Create an order first
      const orderData = OrderFixture.createOrderDto({ userId: testUserId });
      const createResponse = await ordersClient.createOrder(orderData);
      createdOrderIds.push(createResponse.data.id);
      
      const response = await ordersClient.updateOrderStatus(createResponse.data.id, 'confirmed');
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('confirmed');
      expect(isValidOrder(response.data)).toBe(true);
    });
  });

  test.describe('Cancel Order', () => {
    test('should cancel order successfully', async () => {
      // Create an order first
      const orderData = OrderFixture.createOrderDto({ userId: testUserId });
      const createResponse = await ordersClient.createOrder(orderData);
      
      const response = await ordersClient.cancelOrder(createResponse.data.id);
      
      expect(response.status).toBe(204);
    });
  });
});