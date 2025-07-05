import { test, expect } from '@playwright/test';
import { CartClient } from '../../api/ecommerce_api/CartClient';
import { UsersClient } from '../../api/ecommerce_api/UsersClient';
import { CartFixture } from '../../fixtures/ecommerce_fixtures/cart.fixture';
import { UserFixture } from '../../fixtures/ecommerce_fixtures/user.fixture';
import { isValidCart } from '../../schemas/ecommerce_schemas/cart.schema';

test.describe('Cart API', () => {
  let cartClient: CartClient;
  let usersClient: UsersClient;
  let createdUserIds: string[] = [];
  let testUserId: string;

  test.beforeAll(async () => {
    cartClient = new CartClient();
    usersClient = new UsersClient();
    await Promise.all([cartClient.init(), usersClient.init()]);
    
    // Create a test user for cart operations
    const userData = UserFixture.createUserDto();
    const userResponse = await usersClient.createUser(userData);
    testUserId = userResponse.data.id;
    createdUserIds.push(testUserId);
  });

  test.afterAll(async () => {
    // Clear cart
    try {
      await cartClient.clearCart(testUserId);
    } catch (error) {
      console.warn(`Failed to clear cart for user ${testUserId}:`, error);
    }
    
    // Cleanup created users
    for (const userId of createdUserIds) {
      try {
        await usersClient.deleteUser(userId);
      } catch (error) {
        console.warn(`Failed to cleanup user ${userId}:`, error);
      }
    }
    
    await Promise.all([cartClient.dispose(), usersClient.dispose()]);
  });

  test.describe('Get Cart', () => {
    test('should get user cart', async () => {
      const response = await cartClient.getCart(testUserId);
      
      expect(response.status).toBe(200);
      expect(response.data).toBeTruthy();
      expect(response.data.userId).toBe(testUserId);
      expect(isValidCart(response.data)).toBe(true);
    });
  });

  test.describe('Add Item to Cart', () => {
    test('should add item to cart successfully', async () => {
      const itemData = CartFixture.createAddItemDto();
      
      const response = await cartClient.addItem(testUserId, itemData);
      
      expect(response.status).toBe(201);
      expect(response.data).toBeTruthy();
      expect(response.data.productId).toBe(itemData.productId);
    });

    test('should fail to add item with invalid data', async () => {
      const invalidData = CartFixture.createInvalidCart().addItemWithoutProductId;
      
      try {
        await cartClient.addItem(testUserId, invalidData);
        throw new Error('Should have thrown an error');
      } catch (error: any) {
        expect(error.status || error.response?.status).toBe(400);
      }
    });
  });

  test.describe('Update Cart Item', () => {
    test('should update item quantity successfully', async () => {
      // Add an item first
      const itemData = CartFixture.createAddItemDto();
      const addResponse = await cartClient.addItem(testUserId, itemData);
      
      const updateData = CartFixture.createUpdateItemDto({ quantity: 5 });
      const response = await cartClient.updateItem(testUserId, itemData.productId, updateData);
      
      expect(response.status).toBe(200);
      expect(response.data.quantity).toBe(5);
    });
  });

  test.describe('Remove Item from Cart', () => {
    test('should remove item from cart successfully', async () => {
      // Add an item first
      const itemData = CartFixture.createAddItemDto();
      await cartClient.addItem(testUserId, itemData);
      
      const response = await cartClient.removeItem(testUserId, itemData.productId);
      
      expect(response.status).toBe(200);
    });
  });

  test.describe('Clear Cart', () => {
    test('should clear cart successfully', async () => {
      // Add some items first
      const itemData1 = CartFixture.createAddItemDto();
      const itemData2 = CartFixture.createAddItemDto();
      await cartClient.addItem(testUserId, itemData1);
      await cartClient.addItem(testUserId, itemData2);
      
      const response = await cartClient.clearCart(testUserId);
      
      expect(response.status).toBe(200);
    });
  });

  test.describe('Get Cart Total', () => {
    test('should calculate cart total correctly', async () => {
      // Clear cart first
      await cartClient.clearCart(testUserId);
      
      // Add items
      const itemData1 = CartFixture.createAddItemDto({ price: 10, quantity: 2 });
      const itemData2 = CartFixture.createAddItemDto({ price: 15, quantity: 1 });
      await cartClient.addItem(testUserId, itemData1);
      await cartClient.addItem(testUserId, itemData2);
      
      const response = await cartClient.getCartTotal(testUserId);
      
      expect(response.status).toBe(200);
      expect(response.data.total).toBe(35); // (10*2) + (15*1)
      expect(response.data.itemCount).toBe(3); // 2 + 1
    });
  });
});