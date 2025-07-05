import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { productsClient, handleApiResponse, getLastResponse, getLastError, storeCreatedEntity } from '../hooks';
import { ProductFixture } from '../../fixtures/ecommerce_fixtures/product.fixture';
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
  
  try {
    const response = await productsClient.createProduct(this.existingProduct);
    expect(response.status).toBe(201);
    
    const productData = (response.data as any)?.data?.data || response.data;
    this.productId = productData.id;
    storeCreatedEntity('product', this.productId, response.data);
  } catch (error: any) {
    console.log(`❌ Error creating product:`, error.status || 'Unknown error');
    throw error;
  }
});

Given('multiple products exist in the system', async function () {
  this.createdProducts = [];
  
  for (let i = 0; i < 3; i++) {
    const productData = ProductFixture.createProductDto();
    
    try {
      const response = await productsClient.createProduct(productData);
      expect(response.status).toBe(201);
      
      const productDataResponse = (response.data as any)?.data?.data || response.data;
      this.createdProducts.push(productDataResponse);
      storeCreatedEntity('product', productDataResponse.id, response.data);
    } catch (error: any) {
      console.log(`❌ Error creating product ${i}:`, error.status || 'Unknown error');
      throw error;
    }
  }
});

Given('a product with category {string} exists', async function (categoryId: string) {
  this.productData = ProductFixture.createProductDto({ categoryId });
  
  try {
    const response = await productsClient.createProduct(this.productData);
    expect(response.status).toBe(201);
    
    const productData = (response.data as any)?.data?.data || response.data;
    this.productId = productData.id;
    storeCreatedEntity('product', this.productId, response.data);
  } catch (error: any) {
    console.log(`❌ Error creating product with category:`, error.status || 'Unknown error');
    throw error;
  }
});

// When steps
When('I create a product', async function () {
  try {
    const response = await productsClient.createProduct(this.productData);
    handleApiResponse(response);
    
    if (response.status === 201 && response.data) {
      const productData = (response.data as any)?.data?.data || response.data;
      if (productData?.id) {
        this.productId = productData.id;
        storeCreatedEntity('product', productData.id, response.data);
      }
    }
  } catch (error: any) {
    console.log(`❌ Error creating product:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I get all products', async function () {
  try {
    const response = await productsClient.getAllProducts();
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error getting all products:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I get products by category {string}', async function (categoryId: string) {
  try {
    const response = await productsClient.getProductsByCategory(categoryId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error getting products by category:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I get the product by ID', async function () {
  try {
    const response = await productsClient.getProductById(this.productId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error getting product by ID:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I get a product with ID {string}', async function (productId: string) {
  try {
    const response = await productsClient.getProductById(productId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error getting product with ID ${productId}:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I update the product', async function () {
  this.updateData = ProductFixture.updateProductDto();
  
  try {
    const response = await productsClient.updateProduct(this.productId, this.updateData);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error updating product:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I update the product with {string} set to {string}', async function (field: string, value: string) {
  this.updateData = { [field]: value };
  
  try {
    const response = await productsClient.updateProduct(this.productId, this.updateData);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error updating product with ${field}:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I delete the product', async function () {
  try {
    const response = await productsClient.deleteProduct(this.productId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error deleting product:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

// Then steps
Then('the product should be created successfully', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Product creation failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(201);
  expect(response.data).toBeTruthy();
  
  const productData = (response.data as any)?.data?.data || response.data;
  expect(productData.id).toBeTruthy();
  
  // Validate response schema
  expect(isValidProduct(productData)).toBe(true);
});

Then('I should get a list of products', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Getting products failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  const productsData = (response.data as any)?.data?.data || response.data;
  expect(Array.isArray(productsData)).toBe(true);
  
  // Validate response schema
  expect(isValidProductList(productsData)).toBe(true);
});

Then('I should get the product details', function () {
  const response = getLastResponse();
  const error = getLastError();
  
  if (error) {
    console.log(`❌ Error getting product details:`, error);
  }
  
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();
  const productData = (response.data as any)?.data?.data || response.data;
  expect(productData.id).toBe(this.productId);
  
  // Validate response schema
  expect(isValidProduct(productData)).toBe(true);
});

Then('I should get products filtered by category', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Getting products by category failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  const productsData = (response.data as any)?.data?.data || response.data;
  expect(Array.isArray(productsData)).toBe(true);
  
  productsData.forEach((product: any) => {
    expect(product.categoryId).toBeTruthy();
  });
  
  // Validate response schema
  expect(isValidProductList(productsData)).toBe(true);
});

Then('the product should be updated successfully', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Update failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();

  const productData = (response.data as any)?.data?.data || response.data;
  Object.keys(this.updateData).forEach(key => {
    let expected = this.updateData[key];
    let actual = productData[key];
    if (["price", "stock"].includes(key)) {
      expected = Number(expected);
      actual = Number(actual);
    }
    expect(actual).toBe(expected);
  });

  // Validate response schema
  expect(isValidProduct(productData)).toBe(true);
});

Then('the product should be deleted successfully', function () {
  const response = getLastResponse();
  const error = getLastError();
  
  if (error) {
    console.log(`❌ Delete failed:`, error);
  }
  
  expect(response).toBeTruthy();
  expect(response.status).toBe(204);
});

Then('the response should contain valid product data', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Product validation failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.data).toBeTruthy();
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
  const error = getLastError();

  if (error) {
    console.log(`❌ Product count validation failed:`, error);
  }

  expect(response).toBeTruthy();
  const productsData = (response.data as any)?.data?.data || response.data;
  expect(Array.isArray(productsData)).toBe(true);
  expect(productsData.length).toBe(count);
});

Then('each product should have required fields', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Product fields validation failed:`, error);
  }

  expect(response).toBeTruthy();
  const productsData = (response.data as any)?.data?.data || response.data;
  expect(Array.isArray(productsData)).toBe(true);
  
  productsData.forEach((product: any) => {
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