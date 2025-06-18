import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ordersClient, usersClient, handleApiResponse, getLastResponse, getLastError, storeCreatedEntity } from '../hooks';
import { OrderFixture } from '../../fixtures/ecommerce_features/order.fixture';
import { UserFixture } from '../../fixtures/ecommerce_features/user.fixture';
import { isValidOrder, isValidOrderList, getOrderValidationErrors } from '../../schemas/ecommerce_schemas/order.schema';
import { OrderStatus } from '../../types/common';

/**
 * Order BDD step definitions
 */

// Given steps
Given('a test user exists for orders', async function () {
  const userData = UserFixture.createUserDto();
  const response = await usersClient.createUser(userData);
  expect(response.status).toBe(201);
  
  this.testUserId = response.data.id;
  storeCreatedEntity('user', this.testUserId, response.data);
});

Given('I have valid order data', function () {
  this.orderData = OrderFixture.createOrderDto({ userId: this.testUserId });
});

Given('I have invalid order data with missing {string}', function (field: string) {
  this.orderData = OrderFixture.createOrderDto({ userId: this.testUserId });
  delete this.orderData[field];
});

Given('I have order data with empty items array', function () {
  this.orderData = OrderFixture.createInvalidOrder().withoutItems;
  this.orderData.userId = this.testUserId;
});

Given('an order exists in the system', async function () {
  this.existingOrder = OrderFixture.createOrderDto({ userId: this.testUserId });
  const response = await ordersClient.createOrder(this.existingOrder);
  expect(response.status).toBe(201);
  
  this.orderId = response.data.id;
  storeCreatedEntity('order', this.orderId, response.data);
});

Given('multiple orders exist in the system', async function () {
  this.createdOrders = [];
  
  for (let i = 0; i < 3; i++) {
    const orderData = OrderFixture.createOrderDto({ userId: this.testUserId });
    const response = await ordersClient.createOrder(orderData);
    expect(response.status).toBe(201);
    
    this.createdOrders.push(response.data);
    storeCreatedEntity('order', response.data.id, response.data);
  }
});

Given('orders exist for a specific user', async function () {
  this.userOrders = [];
  
  for (let i = 0; i < 2; i++) {
    const orderData = OrderFixture.createOrderDto({ userId: this.testUserId });
    const response = await ordersClient.createOrder(orderData);
    expect(response.status).toBe(201);
    
    this.userOrders.push(response.data);
    storeCreatedEntity('order', response.data.id, response.data);
  }
});

// When steps
When('I create an order', async function () {
  try {
    const response = await ordersClient.createOrder(this.orderData);
    handleApiResponse(response);
    
    if (response.status === 201 && response.data?.id) {
      storeCreatedEntity('order', response.data.id, response.data);
    }
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I get all orders', async function () {
  try {
    const response = await ordersClient.getAllOrders();
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I get orders by user ID', async function () {
  try {
    const response = await ordersClient.getOrdersByUser(this.testUserId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I get the order by ID', async function () {
  try {
    const response = await ordersClient.getOrderById(this.orderId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I get an order with ID {string}', async function (orderId: string) {
  try {
    const response = await ordersClient.getOrderById(orderId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I update the order status to {string}', async function (status: string) {
  // Validar que el status sea un valor válido de OrderStatus
  const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status as OrderStatus)) {
    throw new Error(`Invalid order status: ${status}. Valid values are: ${validStatuses.join(', ')}`);
  }
  
  this.updateData = { status };
  
  try {
    const response = await ordersClient.updateOrderStatus(this.orderId, status as OrderStatus);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I cancel the order', async function () {
  try {
    const response = await ordersClient.cancelOrder(this.orderId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

// Then steps
Then('the order should be created successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(201);
  expect(response.data).toBeTruthy();
  expect(response.data.id).toBeTruthy();
  
  // Validate response schema
  expect(isValidOrder(response.data)).toBe(true);
});

Then('I should get a list of orders', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(Array.isArray(response.data)).toBe(true);
  
  // Validate response schema
  expect(isValidOrderList(response.data)).toBe(true);
});

Then('I should get orders filtered by user', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(Array.isArray(response.data)).toBe(true);
  
  // All orders should belong to the test user
  response.data.forEach((order: any) => {
    expect(order.userId).toBe(this.testUserId);
  });
  
  // Validate response schema
  expect(isValidOrderList(response.data)).toBe(true);
});

Then('I should get the order details', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();
  expect(response.data.id).toBe(this.orderId);
  
  // Validate response schema
  expect(isValidOrder(response.data)).toBe(true);
});

Then('the order should be updated successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();
  
  // Validate response schema
  expect(isValidOrder(response.data)).toBe(true);
});

Then('the order status should be {string}', function (expectedStatus: string) {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.data.status).toBe(expectedStatus);
});

Then('the order should be cancelled successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(204);
});

Then('the response should contain valid order data', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.data).toBeTruthy();
  
  // Validate response schema
  expect(isValidOrder(response.data)).toBe(true);
  
  if (!isValidOrder(response.data)) {
    const errors = getOrderValidationErrors(response.data);
    throw new Error(`Invalid order data: ${errors.join(', ')}`);
  }
});

Then('each order should have required fields', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(Array.isArray(response.data)).toBe(true);
  
  response.data.forEach((order: any) => {
    expect(order.id).toBeTruthy();
    expect(order.userId).toBeTruthy();
    expect(Array.isArray(order.items)).toBe(true);
    expect(order.items.length).toBeGreaterThan(0);
    expect(order.status).toBeTruthy();
    expect(typeof order.totalAmount).toBe('number');
    expect(order.shippingAddress).toBeTruthy();
    expect(order.createdAt).toBeTruthy();
    expect(order.updatedAt).toBeTruthy();
  });
});