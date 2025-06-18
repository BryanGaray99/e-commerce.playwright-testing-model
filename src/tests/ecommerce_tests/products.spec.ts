import { test, expect } from '@playwright/test';
import { ProductsClient } from '../../api/ecommerce_api/ProductsClient';
import { ProductFixture } from '../../fixtures/ecommerce_features/product.fixture';
import { isValidProduct, isValidProductList } from '../../schemas/ecommerce_schemas/product.schema';

test.describe('Products API', () => {
  let productsClient: ProductsClient;
  let createdProductIds: string[] = [];

  test.beforeAll(async () => {
    productsClient = new ProductsClient();
    await productsClient.init();
  });

  test.afterAll(async () => {
    // Cleanup created products
    for (const productId of createdProductIds) {
      try {
        await productsClient.deleteProduct(productId);
      } catch (error) {
        console.warn(`Failed to cleanup product ${productId}:`, error);
      }
    }
    await productsClient.dispose();
  });

  test.describe('Create Product', () => {
    test('should create a product successfully', async () => {
      const productData = ProductFixture.createProductDto();
      
      const response = await productsClient.createProduct(productData);
      
      expect(response.status).toBe(201);
      expect(response.data).toBeTruthy();
      expect(response.data.id).toBeTruthy();
      expect(isValidProduct(response.data)).toBe(true);
      
      createdProductIds.push(response.data.id);
    });

    test('should fail to create product with invalid data', async () => {
      const invalidData = ProductFixture.createInvalidProduct().withoutName;
      
      try {
        await productsClient.createProduct(invalidData);
        throw new Error('Should have thrown an error');
      } catch (error: any) {
        expect(error.status || error.response?.status).toBe(400);
      }
    });
  });

  test.describe('Get Products', () => {
    test('should get all products', async () => {
      const response = await productsClient.getAllProducts();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(isValidProductList(response.data)).toBe(true);
    });

    test('should get product by ID', async () => {
      // Create a product first
      const productData = ProductFixture.createProductDto();
      const createResponse = await productsClient.createProduct(productData);
      createdProductIds.push(createResponse.data.id);
      
      const response = await productsClient.getProductById(createResponse.data.id);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(createResponse.data.id);
      expect(isValidProduct(response.data)).toBe(true);
    });

    test('should return 404 for non-existent product', async () => {
      try {
        await productsClient.getProductById('non-existent-id');
        throw new Error('Should have thrown an error');
      } catch (error: any) {
        expect(error.status || error.response?.status).toBe(404);
      }
    });
  });

  test.describe('Update Product', () => {
    test('should update product successfully', async () => {
      // Create a product first
      const productData = ProductFixture.createProductDto();
      const createResponse = await productsClient.createProduct(productData);
      createdProductIds.push(createResponse.data.id);
      
      const updateData = ProductFixture.updateProductDto({ name: 'Updated Product Name' });
      const response = await productsClient.updateProduct(createResponse.data.id, updateData);
      
      expect(response.status).toBe(200);
      expect(response.data.name).toBe('Updated Product Name');
      expect(isValidProduct(response.data)).toBe(true);
    });
  });

  test.describe('Delete Product', () => {
    test('should delete product successfully', async () => {
      // Create a product first
      const productData = ProductFixture.createProductDto();
      const createResponse = await productsClient.createProduct(productData);
      
      const response = await productsClient.deleteProduct(createResponse.data.id);
      
      expect(response.status).toBe(204);
    });
  });
});