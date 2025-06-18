import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { productsClient, handleApiResponse, getLastResponse, getLastError, storeCreatedEntity } from '../hooks';
import { ProductFixture } from '../../fixtures/ecommerce_features/product.fixture';
import { isValidProduct, isValidProductList, getProductValidationErrors } from '../../schemas/ecommerce_schemas/product.schema';

/**
 * Product BDD step definitions
 */

// Given steps
Given('I have valid product data', function () {
  this.productData = ProductFixture.createProductDto();
});

Given('I have invalid product data with missing {string}', function (field: string) {
  this.productData = ProductFixture.createProductDto();
  delete this.productData[field];
});

Given('I have product data with invalid {string}', function (field: string) {
  this.productData = ProductFixture.createProductDto();
  switch (field) {
    case 'price':
      this.productData.price = -10;
      break;
    case 'stock':
      this.productData.stock = -5;
      break;
    case 'name':
      this.productData.name = '';
      break;
  }
});

Given('a product exists in the system', async function () {
  this.existingProduct = ProductFixture.createProductDto();
  const response = await productsClient.createProduct(this.existingProduct);
  expect(response.status).toBe(201);
  
  this.productId = response.data.id;
  storeCreatedEntity('product', this.productId, response.data);
});

Given('multiple products exist in the system', async function () {
  this.createdProducts = [];
  
  for (let i = 0; i < 3; i++) {
    const productData = ProductFixture.createProductDto();
    const response = await productsClient.createProduct(productData);
    expect(response.status).toBe(201);
    
    this.createdProducts.push(response.data);
    storeCreatedEntity('product', response.data.id, response.data);
  }
});

Given('a product with category {string} exists', async function (categoryId: string) {
  this.productData = ProductFixture.createProductDto({ categoryId });
  const response = await productsClient.createProduct(this.productData);
  expect(response.status).toBe(201);
  
  this.productId = response.data.id;
  storeCreatedEntity('product', this.productId, response.data);
});

// When steps
When('I create a product', async function () {
  try {
    const response = await productsClient.createProduct(this.productData);
    handleApiResponse(response);
    
    // The backend returns a nested structure: response.data.data.data.id
    const productData = (response.data as any)?.data?.data || response.data;
    if (response.status === 201 && productData?.id) {
      storeCreatedEntity('product', productData.id, productData);
      this.productId = productData.id; // Store for later use
      console.log(`✅ Product created with ID: ${productData.id}`);
    }
  } catch (error: any) {
    console.log(`❌ Product creation failed: ${error.status || 'Unknown error'}`);
    handleApiResponse(null, error);
  }
});

When('I get all products', async function () {
  try {
    const response = await productsClient.getAllProducts();
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I get products by category {string}', async function (categoryId: string) {
  try {
    const response = await productsClient.getProductsByCategory(categoryId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I get the product by ID', async function () {
  try {
    console.log(`🔍 Getting product with ID: ${this.productId}`);
    const response = await productsClient.getProductById(this.productId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Failed to get product ${this.productId}: ${error.status || 'Unknown error'}`);
    handleApiResponse(null, error);
  }
});

When('I get a product with ID {string}', async function (productId: string) {
  try {
    const response = await productsClient.getProductById(productId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I update the product', async function () {
  this.updateData = ProductFixture.updateProductDto();
  
  try {
    console.log(`🔍 Updating product with ID: ${this.productId}`);
    const response = await productsClient.updateProduct(this.productId, this.updateData);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Failed to update product ${this.productId}: ${error.status || 'Unknown error'}`);
    handleApiResponse(null, error);
  }
});

When('I update the product with {string} set to {string}', async function (field: string, value: string) {
  this.updateData = { [field]: value };
  
  try {
    const response = await productsClient.updateProduct(this.productId, this.updateData);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I delete the product', async function () {
  try {
    console.log(`🔍 Deleting product with ID: ${this.productId}`);
    const response = await productsClient.deleteProduct(this.productId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Failed to delete product ${this.productId}: ${error.status || 'Unknown error'}`);
    handleApiResponse(null, error);
  }
});

// Then steps
Then('the product should be created successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(201);
  expect(response.data).toBeTruthy();
  
  // The backend returns a nested structure: response.data.data.data.id
  const productData = (response.data as any)?.data?.data || response.data;
  expect(productData.id).toBeTruthy();
  
  // Store the product ID for later use
  this.productId = productData.id;
  
  // Validate response schema
  expect(isValidProduct(productData)).toBe(true);
});

Then('I should get a list of products', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(Array.isArray(response.data)).toBe(true);
  
  // Validate response schema
  expect(isValidProductList(response.data)).toBe(true);
});

Then('I should get the product details', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();
  
  console.log(`🔍 Expected productId: ${this.productId}, Actual productId: ${response.data?.id}`);
  expect(response.data.id).toBe(this.productId);
  
  // Validate response schema
  expect(isValidProduct(response.data)).toBe(true);
});

Then('I should get products filtered by category', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(Array.isArray(response.data)).toBe(true);
  
  // Validate all products belong to the category
  response.data.forEach((product: any) => {
    expect(product.categoryId).toBeTruthy();
  });
  
  // Validate response schema
  expect(isValidProductList(response.data)).toBe(true);
});

Then('the product should be updated successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();
  
  // Verify update data is reflected
  Object.keys(this.updateData).forEach(key => {
    expect(response.data[key]).toBe(this.updateData[key]);
  });
  
  // Validate response schema
  expect(isValidProduct(response.data)).toBe(true);
});

Then('the product should be deleted successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(204);
});

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

Then('I should receive a validation error', function () {
  const error = getLastError();
  const response = getLastResponse();
  
  // Check if we have an error or a response with error status
  if (error) {
    expect(error.status || error.response?.status).toBe(422);
  } else if (response && response.status >= 400) {
    expect(response.status).toBe(422);
  } else {
    throw new Error('Expected validation error but none was found');
  }
});

Then('I should receive a not found error', function () {
  const error = getLastError();
  expect(error).toBeTruthy();
  expect(error.status || error.response?.status).toBe(404);
});

Then('the response should contain valid product data', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.data).toBeTruthy();
  
  // The backend returns a nested structure: response.data.data.data
  const productData = (response.data as any)?.data?.data || response.data;
  
  // Validate response schema
  expect(isValidProduct(productData)).toBe(true);
  
  if (!isValidProduct(productData)) {
    const errors = getProductValidationErrors(productData);
    throw new Error(`Invalid product data: ${errors.join(', ')}`);
  }
});

Then('the list should contain {int} products', function (count: number) {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data.length).toBe(count);
});

Then('each product should have required fields', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(Array.isArray(response.data)).toBe(true);
  
  response.data.forEach((product: any) => {
    expect(product.id).toBeTruthy();
    expect(product.name).toBeTruthy();
    expect(product.description).toBeTruthy();
    expect(typeof product.price).toBe('number');
    expect(product.categoryId).toBeTruthy();
    expect(typeof product.stock).toBe('number');
    expect(typeof product.isActive).toBe('boolean');
    expect(product.createdAt).toBeTruthy();
    expect(product.updatedAt).toBeTruthy();
  });
});