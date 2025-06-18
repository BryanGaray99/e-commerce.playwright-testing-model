import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { cartClient, usersClient, handleApiResponse, getLastResponse, getLastError, storeCreatedEntity, testData } from '../hooks';
import { CartFixture } from '../../fixtures/ecommerce_features/cart.fixture';
import { UserFixture } from '../../fixtures/ecommerce_features/user.fixture';
import { isValidCart, getCartValidationErrors } from '../../schemas/ecommerce_schemas/cart.schema';

/**
 * Cart BDD step definitions
 */

// Given steps
Given('a test user exists for cart operations', async function () {
  const userData = UserFixture.createUserDto();
  const response = await usersClient.createUser(userData);
  expect(response.status).toBe(201);
  
  this.testUserId = response.data.id;
  storeCreatedEntity('user', this.testUserId, response.data);
  testData.userCarts.set(this.testUserId, {});
});

Given('I have valid cart item data', function () {
  this.itemData = CartFixture.createAddItemDto();
});

Given('I have invalid cart item data with missing {string}', function (field: string) {
  this.itemData = CartFixture.createAddItemDto();
  delete this.itemData[field];
});

Given('I have cart item data with invalid {string}', function (field: string) {
  this.itemData = CartFixture.createAddItemDto();
  switch (field) {
    case 'quantity':
      this.itemData.quantity = 0;
      break;
    case 'price':
      this.itemData.price = -10;
      break;
  }
});

Given('an item exists in the cart', async function () {
  this.existingItem = CartFixture.createAddItemDto();
  const response = await cartClient.addItem(this.testUserId, this.existingItem);
  expect(response.status).toBe(201);
  
  this.existingProductId = this.existingItem.productId;
});

Given('multiple items exist in the cart', async function () {
  this.cartItems = [];
  
  for (let i = 0; i < 3; i++) {
    const itemData = CartFixture.createAddItemDto();
    const response = await cartClient.addItem(this.testUserId, itemData);
    expect(response.status).toBe(201);
    
    this.cartItems.push(itemData);
  }
});

Given('the cart is empty', async function () {
  try {
    await cartClient.clearCart(this.testUserId);
  } catch (error) {
    // Cart might already be empty, ignore error
  }
});

// When steps
When('I get the user cart', async function () {
  try {
    const response = await cartClient.getCart(this.testUserId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I add the item to cart', async function () {
  try {
    const response = await cartClient.addItem(this.testUserId, this.itemData);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I update the item quantity to {int}', async function (quantity: number) {
  this.updateData = { quantity };
  
  try {
    const response = await cartClient.updateItem(this.testUserId, this.existingProductId, this.updateData);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I remove the item from cart', async function () {
  try {
    const response = await cartClient.removeItem(this.testUserId, this.existingProductId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I remove a non-existent item from cart', async function () {
  try {
    const response = await cartClient.removeItem(this.testUserId, 'non-existent-product-id');
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I clear the cart', async function () {
  try {
    const response = await cartClient.clearCart(this.testUserId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I add an item with price {float} and quantity {int}', async function (price: number, quantity: number) {
  const itemData = CartFixture.createAddItemDto({ price, quantity });
  
  try {
    const response = await cartClient.addItem(this.testUserId, itemData);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I add multiple different items to cart', async function () {
  this.addedItems = [];
  
  for (let i = 0; i < 3; i++) {
    const itemData = CartFixture.createAddItemDto();
    const response = await cartClient.addItem(this.testUserId, itemData);
    expect(response.status).toBe(201);
    
    this.addedItems.push(itemData);
  }
  
  handleApiResponse({ status: 201, data: this.addedItems });
});

When('I update quantities of multiple items', async function () {
  for (const item of this.addedItems) {
    const updateData = { quantity: 5 };
    const response = await cartClient.updateItem(this.testUserId, item.productId, updateData);
    expect(response.status).toBe(200);
  }
  
  handleApiResponse({ status: 200, data: 'Updated' });
});

When('I remove some items from cart', async function () {
  // Remove first item
  const itemToRemove = this.addedItems[0];
  const response = await cartClient.removeItem(this.testUserId, itemToRemove.productId);
  expect(response.status).toBe(200);
  
  this.removedItem = itemToRemove;
  handleApiResponse(response);
});

When('I add another item to cart', async function () {
  this.secondItem = CartFixture.createAddItemDto();
  
  try {
    const response = await cartClient.addItem(this.testUserId, this.secondItem);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I update the item quantity', async function () {
  this.updateData = { quantity: 3 };
  
  try {
    const response = await cartClient.updateItem(this.testUserId, this.itemData.productId, this.updateData);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I remove the first item from cart', async function () {
  try {
    const response = await cartClient.removeItem(this.testUserId, this.itemData.productId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

// Then steps
Then('I should get the cart details', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();
  expect(response.data.userId).toBe(this.testUserId);
});

Then('the response should contain valid cart data', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.data).toBeTruthy();
  
  // Validate response schema
  expect(isValidCart(response.data)).toBe(true);
  
  if (!isValidCart(response.data)) {
    const errors = getCartValidationErrors(response.data);
    throw new Error(`Invalid cart data: ${errors.join(', ')}`);
  }
});

Then('the item should be added successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(201);
  expect(response.data).toBeTruthy();
});

Then('the cart should contain the item', async function () {
  const cartResponse = await cartClient.getCart(this.testUserId);
  expect(cartResponse.status).toBe(200);
  
  const item = cartResponse.data.items.find((item: any) => item.productId === this.itemData.productId);
  expect(item).toBeTruthy();
});

Then('the item should be updated successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();
});

Then('the item quantity should be {int}', function (expectedQuantity: number) {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.data.quantity).toBe(expectedQuantity);
});

Then('the item should be removed successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
});

Then('the cart should be cleared successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
});

Then('the cart should be empty', async function () {
  const cartResponse = await cartClient.getCart(this.testUserId);
  expect(cartResponse.status).toBe(200);
  expect(cartResponse.data.items).toHaveLength(0);
  expect(cartResponse.data.totalAmount).toBe(0);
  expect(cartResponse.data.itemCount).toBe(0);
});

Then('the cart total should be {float}', async function (expectedTotal: number) {
  const totalResponse = await cartClient.getCartTotal(this.testUserId);
  expect(totalResponse.status).toBe(200);
  expect(totalResponse.data.total).toBe(expectedTotal);
});

Then('the cart item count should be {int}', async function (expectedCount: number) {
  const totalResponse = await cartClient.getCartTotal(this.testUserId);
  expect(totalResponse.status).toBe(200);
  expect(totalResponse.data.itemCount).toBe(expectedCount);
});

Then('all items should be added successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(201);
});

Then('all items should be updated successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
});

Then('the specified items should be removed', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
});

Then('the remaining items should still be in cart', async function () {
  const cartResponse = await cartClient.getCart(this.testUserId);
  expect(cartResponse.status).toBe(200);
  
  // Should have 2 items remaining (3 added - 1 removed)
  expect(cartResponse.data.items).toHaveLength(2);
  
  // Removed item should not be in cart
  const removedItem = cartResponse.data.items.find((item: any) => item.productId === this.removedItem.productId);
  expect(removedItem).toBeFalsy();
});