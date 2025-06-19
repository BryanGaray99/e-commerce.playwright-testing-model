import { Before, After, BeforeAll, AfterAll, setDefaultTimeout, Given, Then } from '@cucumber/cucumber';
import { ProductsClient } from '../api/ecommerce_api/ProductsClient';
import { UsersClient } from '../api/ecommerce_api/UsersClient';
import { OrdersClient } from '../api/ecommerce_api/OrdersClient';
import { CategoriesClient } from '../api/ecommerce_api/CategoriesClient';
import { CartClient } from '../api/ecommerce_api/CartClient';
import { expect } from '@playwright/test';

// Set default timeout for all steps
setDefaultTimeout(30000);

// Global API clients
export let productsClient: ProductsClient;
export let usersClient: UsersClient;
export let ordersClient: OrdersClient;
export let categoriesClient: CategoriesClient;
export let cartClient: CartClient;

// Test data storage
export const testData = {
  createdProducts: new Map<string, any>(),
  createdUsers: new Map<string, any>(),
  createdOrders: new Map<string, any>(),
  createdCategories: new Map<string, any>(),
  userCarts: new Map<string, any>(),
  lastResponse: null as any,
  lastError: null as any
};

/**
 * Initialize all API clients before test suite
 */
BeforeAll(async function() {
  console.log('🚀 Initializing API clients for BDD tests...');
  
  // Initialize all clients
  productsClient = new ProductsClient();
  usersClient = new UsersClient();
  ordersClient = new OrdersClient();
  categoriesClient = new CategoriesClient();
  cartClient = new CartClient();

  // Initialize client contexts
  await Promise.all([
    productsClient.init(),
    usersClient.init(),
    ordersClient.init(),
    categoriesClient.init(),
    cartClient.init()
  ]);

  console.log('✅ All API clients initialized successfully');
});

/**
 * Clean up before each scenario
 */
Before(async function() {
  // Clear test data between scenarios
  testData.lastResponse = null;
  testData.lastError = null;
  
  // Note: We don't clear created entities as they might be needed across scenarios
  // Cleanup will happen in After hook if needed
});

/**
 * Clean up after each scenario
 */
After(async function() {
  // Clean up created test data
  try {
    // Clean up in reverse order to respect dependencies
    
    // Clear carts
    for (const [userId] of testData.userCarts) {
      try {
        await cartClient.clearCart(userId);
      } catch (error: any) {
        console.warn(`Failed to clear cart for user ${userId}:`, error.message);
      }
    }
    
    // Delete created orders
    for (const [orderId] of testData.createdOrders) {
      try {
        await ordersClient.cancelOrder(orderId);
      } catch (error: any) {
        console.warn(`Failed to delete order ${orderId}:`, error.message);
      }
    }
    
    // Delete created products
    for (const [productId] of testData.createdProducts) {
      try {
        await productsClient.deleteProduct(productId);
      } catch (error: any) {
        console.warn(`Failed to delete product ${productId}:`, error.message);
      }
    }
    
    // Delete created users
    for (const [userId] of testData.createdUsers) {
      try {
        await usersClient.deleteUser(userId);
      } catch (error: any) {
        console.warn(`Failed to delete user ${userId}:`, error.message);
      }
    }
    
    // Delete created categories
    for (const [categoryId] of testData.createdCategories) {
      try {
        await categoriesClient.deleteCategory(categoryId);
      } catch (error: any) {
        console.warn(`Failed to delete category ${categoryId}:`, error.message);
      }
    }
    
  } catch (error: any) {
    console.warn('Error during test cleanup:', error.message);
  } finally {
    // Clear all test data
    testData.createdProducts.clear();
    testData.createdUsers.clear();
    testData.createdOrders.clear();
    testData.createdCategories.clear();
    testData.userCarts.clear();
  }
});

/**
 * Clean up after all scenarios
 */
AfterAll(async function() {
  console.log('🧹 Cleaning up API clients...');
  
  // Dispose all client contexts
  await Promise.all([
    productsClient?.dispose(),
    usersClient?.dispose(),
    ordersClient?.dispose(),
    categoriesClient?.dispose(),
    cartClient?.dispose()
  ]);

  console.log('✅ All API clients disposed successfully');
});

/**
 * Helper function to handle API responses and errors
 */
export function handleApiResponse(response: any, error?: any) {
  if (error) {
    testData.lastError = error;
    testData.lastResponse = null;
  } else if (response && response.status >= 400) {
    // Treat 4xx and 5xx status codes as errors
    testData.lastError = {
      status: response.status,
      message: response.data?.message || 'HTTP Error',
      response: response
    };
    testData.lastResponse = null;
  } else {
    testData.lastResponse = response;
    testData.lastError = null;
  }
}

/**
 * Helper function to get the last response
 */
export function getLastResponse() {
  return testData.lastResponse;
}

/**
 * Helper function to get the last error
 */
export function getLastError() {
  return testData.lastError;
}

/**
 * Helper function to store created entity
 */
export function storeCreatedEntity(type: 'product' | 'user' | 'order' | 'category', id: string, data: any) {
  switch (type) {
    case 'product':
      testData.createdProducts.set(id, data);
      break;
    case 'user':
      testData.createdUsers.set(id, data);
      break;
    case 'order':
      testData.createdOrders.set(id, data);
      break;
    case 'category':
      testData.createdCategories.set(id, data);
      break;
  }
}

/**
 * Helper function to get created entity
 */
export function getCreatedEntity(type: 'product' | 'user' | 'order' | 'category', id: string) {
  switch (type) {
    case 'product':
      return testData.createdProducts.get(id);
    case 'user':
      return testData.createdUsers.get(id);
    case 'order':
      return testData.createdOrders.get(id);
    case 'category':
      return testData.createdCategories.get(id);
    default:
      return null;
  }
}

/**
 * Step definition for API availability check
 */
Given('the API is available', async function() {
  // This step ensures that the API clients are properly initialized
  // The actual initialization happens in BeforeAll hook
  // We can add additional health checks here if needed
  
  // Verify that all clients are initialized
  if (!productsClient || !usersClient || !ordersClient || !categoriesClient || !cartClient) {
    throw new Error('API clients are not properly initialized');
  }
  
  // Optional: Add a simple health check to verify API is responding
  try {
    // You could add a simple health check endpoint call here
    // For now, we'll just verify the clients exist
    console.log('✅ API is available and ready for testing');
  } catch (error: any) {
    throw new Error(`API is not available: ${error.message}`);
  }
});

/**
 * Centralized step definition for validation errors
 */
Then('I should receive a validation error', function () {
  const error = getLastError();
  const response = getLastResponse();
  
  if (error) {
    expect(error.status || error.response?.status).toBe(422);
  } else if (response && response.status >= 400) {
    expect(response.status).toBe(422);
  } else {
    throw new Error('Expected validation error but none was found');
  }
});

/**
 * Centralized step definition for status codes
 */
Then('I should receive a {int} status code', function (statusCode: number) {
  const response = getLastResponse();
  const error = getLastError();
  
  if (error) {
    expect(error.status || error.response?.status).toBe(statusCode);
  } else if (response) {
    expect(response.status).toBe(statusCode);
  } else {
    throw new Error(`Expected status code ${statusCode} but no response or error was found`);
  }
});

/**
 * Centralized step definition for not found errors
 */
Then('I should receive a not found error', function () {
  const error = getLastError();
  expect(error).toBeTruthy();
  expect(error.status || error.response?.status).toBe(404);
});