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
  
  try {
    const response = await usersClient.createUser(userData);
    expect(response.status).toBe(201);
    
    // Acceder a la estructura anidada de la respuesta
    const userDataResponse = (response.data as any)?.data?.data || response.data;
    this.testUserId = userDataResponse.id;
    
    storeCreatedEntity('user', this.testUserId, response.data);
  } catch (error: any) {
    console.log(`❌ Error creating test user for cart:`, error.status || 'Unknown error');
    throw error;
  }
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
  
  try {
    const response = await cartClient.addItem(this.testUserId, this.existingItem);
    expect(response.status).toBe(201);
    
    this.existingProductId = this.existingItem.productId;
  } catch (error: any) {
    console.log(`❌ Error adding item to cart:`, error.status || 'Unknown error');
    throw error;
  }
});

Given('multiple items exist in the cart', async function () {
  this.cartItems = [];
  
  for (let i = 0; i < 3; i++) {
    const itemData = CartFixture.createAddItemDto();
    
    try {
      const response = await cartClient.addItem(this.testUserId, itemData);
      expect(response.status).toBe(201);
      
      this.cartItems.push(itemData);
    } catch (error: any) {
      console.log(`❌ Error adding item ${i} to cart:`, error.status || 'Unknown error');
      throw error;
    }
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
  } catch (error: any) {
    console.log(`❌ Error getting user cart:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I add an item to cart', async function () {
  this.itemData = CartFixture.createAddItemDto();
  
  try {
    const response = await cartClient.addItem(this.testUserId, this.itemData);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error adding item to cart:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I add the item to cart', async function () {
  try {
    const response = await cartClient.addItem(this.testUserId, this.itemData);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error adding item to cart:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I update the item quantity to {int}', async function (quantity: number) {
  this.updateData = { quantity };
  
  try {
    const response = await cartClient.updateItem(this.testUserId, this.existingProductId, this.updateData);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error updating item quantity:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I remove the item from cart', async function () {
  try {
    const response = await cartClient.removeItem(this.testUserId, this.existingProductId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error removing item from cart:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I remove a non-existent item from cart', async function () {
  try {
    const response = await cartClient.removeItem(this.testUserId, 'non-existent-product-id');
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error removing non-existent item:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I clear the cart', async function () {
  try {
    const response = await cartClient.clearCart(this.testUserId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error clearing cart:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I add an item with price {float} and quantity {int}', async function (price: number, quantity: number) {
  const itemData = CartFixture.createAddItemDto({ price, quantity });
  
  try {
    const response = await cartClient.addItem(this.testUserId, itemData);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error adding item with specific price/quantity:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I add multiple different items to cart', async function () {
  this.addedItems = [];
  
  for (let i = 0; i < 3; i++) {
    const itemData = CartFixture.createAddItemDto();
    
    try {
      const response = await cartClient.addItem(this.testUserId, itemData);
      expect(response.status).toBe(201);
      
      this.addedItems.push(itemData);
    } catch (error: any) {
      console.log(`❌ Error adding multiple items ${i}:`, error.status || 'Unknown error');
      throw error;
    }
  }
  
  handleApiResponse({ status: 201, data: this.addedItems });
});

When('I update quantities of multiple items', async function () {
  for (const item of this.addedItems) {
    const updateData = { quantity: 5 };
    
    try {
      const response = await cartClient.updateItem(this.testUserId, item.productId, updateData);
      expect(response.status).toBe(200);
    } catch (error: any) {
      console.log(`❌ Error updating multiple items:`, error.status || 'Unknown error');
      throw error;
    }
  }
  
  handleApiResponse({ status: 200, data: 'Updated' });
});

When('I remove some items from cart', async function () {
  // Remove first item
  const itemToRemove = this.addedItems[0];
  
  try {
    const response = await cartClient.removeItem(this.testUserId, itemToRemove.productId);
    expect(response.status).toBe(200);
    
    this.removedItem = itemToRemove;
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error removing some items:`, error.status || 'Unknown error');
    throw error;
  }
});

When('I add another item to cart', async function () {
  this.secondItem = CartFixture.createAddItemDto();
  
  try {
    const response = await cartClient.addItem(this.testUserId, this.secondItem);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error adding another item:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I update the item quantity', async function () {
  this.updateData = { quantity: 3 };
  
  try {
    const response = await cartClient.updateItem(this.testUserId, this.itemData.productId, this.updateData);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error updating item quantity:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I remove the first item from cart', async function () {
  try {
    const response = await cartClient.removeItem(this.testUserId, this.itemData.productId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error removing first item:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

// Then steps
Then('I should get the cart details', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Getting cart details failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();
  
  const cartData = (response.data as any)?.data?.data || response.data;
  expect(cartData.userId).toBe(this.testUserId);
  
  // Validate response schema
  expect(isValidCart(cartData)).toBe(true);
});

Then('the response should contain valid cart data', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Cart validation failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.data).toBeTruthy();
  
  const cartData = (response.data as any)?.data?.data || response.data;
  
  // Validate response schema
  expect(isValidCart(cartData)).toBe(true);
  
  if (!isValidCart(cartData)) {
    const errors = getCartValidationErrors(cartData);
    throw new Error(`Invalid cart data: ${errors.join(', ')}`);
  }
});

Then('the item should be added successfully', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Item addition failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(201);
  expect(response.data).toBeTruthy();
});

Then('the cart should contain the item', async function () {
  try {
    const cartResponse = await cartClient.getCart(this.testUserId);
    expect(cartResponse.status).toBe(200);
    
    const cartData = (cartResponse.data as any)?.data?.data || cartResponse.data;
    const item = cartData.items.find((item: any) => item.productId === this.itemData.productId);
    expect(item).toBeTruthy();
  } catch (error: any) {
    console.log(`❌ Error verifying cart contains item:`, error.status || 'Unknown error');
    throw error;
  }
});

Then('the item should be updated successfully', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Item update failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();
});

Then('the item quantity should be {int}', function (expectedQuantity: number) {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Item quantity validation failed:`, error);
  }

  expect(response).toBeTruthy();
  
  // La respuesta de updateItem devuelve el cart completo, no solo el item
  const cartData = (response.data as any)?.data?.data || response.data;
  const updatedItem = cartData.items.find((item: any) => item.productId === this.existingProductId);
  expect(updatedItem).toBeTruthy();
  expect(updatedItem.quantity).toBe(expectedQuantity);
});

Then('the item should be removed successfully', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Item removal failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
});

Then('the cart should be cleared successfully', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Cart clearing failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
});

Then('the cart should be empty', async function () {
  try {
    const cartResponse = await cartClient.getCart(this.testUserId);
    expect(cartResponse.status).toBe(200);
    
    const cartData = (cartResponse.data as any)?.data?.data || cartResponse.data;
    expect(cartData.items).toHaveLength(0);
    expect(cartData.totalAmount).toBe(0);
    expect(cartData.itemCount).toBe(0);
  } catch (error: any) {
    console.log(`❌ Error verifying empty cart:`, error.status || 'Unknown error');
    throw error;
  }
});

Then('the cart total should be {float}', async function (expectedTotal: number) {
  try {
    const totalResponse = await cartClient.getCartTotal(this.testUserId);
    expect(totalResponse.status).toBe(200);
    
    const totalData = (totalResponse.data as any)?.data?.data || totalResponse.data;
    expect(totalData.total).toBe(expectedTotal);
  } catch (error: any) {
    console.log(`❌ Error getting cart total:`, error.status || 'Unknown error');
    throw error;
  }
});

Then('the cart item count should be {int}', async function (expectedCount: number) {
  try {
    const totalResponse = await cartClient.getCartTotal(this.testUserId);
    expect(totalResponse.status).toBe(200);
    
    const totalData = (totalResponse.data as any)?.data?.data || totalResponse.data;
    expect(totalData.itemCount).toBe(expectedCount);
  } catch (error: any) {
    console.log(`❌ Error getting cart item count:`, error.status || 'Unknown error');
    throw error;
  }
});

Then('all items should be added successfully', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Multiple items addition failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(201);
});

Then('all items should be updated successfully', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Multiple items update failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
});

Then('the specified items should be removed', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Items removal failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
});

Then('the remaining items should still be in cart', async function () {
  try {
    const cartResponse = await cartClient.getCart(this.testUserId);
    expect(cartResponse.status).toBe(200);
    
    const cartData = (cartResponse.data as any)?.data?.data || cartResponse.data;
    
    // Should have 2 items remaining (3 added - 1 removed)
    expect(cartData.items).toHaveLength(2);
    
    // Removed item should not be in cart
    const removedItem = cartData.items.find((item: any) => item.productId === this.removedItem.productId);
    expect(removedItem).toBeFalsy();
  } catch (error: any) {
    console.log(`❌ Error verifying remaining items:`, error.status || 'Unknown error');
    throw error;
  }
});
