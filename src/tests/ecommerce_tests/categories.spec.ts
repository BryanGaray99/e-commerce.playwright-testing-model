import { test, expect } from '@playwright/test';
import { CategoriesClient } from '../../api/ecommerce_api/CategoriesClient';
import { CategoryFixture } from '../../fixtures/ecommerce_fixtures/category.fixture';
import { isValidCategory, isValidCategoryList } from '../../schemas/ecommerce_schemas/category.schema';

test.describe('Categories API', () => {
  let categoriesClient: CategoriesClient;
  let createdCategoryIds: string[] = [];

  test.beforeAll(async () => {
    categoriesClient = new CategoriesClient();
    await categoriesClient.init();
  });

  test.afterAll(async () => {
    // Cleanup created categories
    for (const categoryId of createdCategoryIds) {
      try {
        await categoriesClient.deleteCategory(categoryId);
      } catch (error) {
        console.warn(`Failed to cleanup category ${categoryId}:`, error);
      }
    }
    await categoriesClient.dispose();
  });

  test.describe('Create Category', () => {
    test('should create a category successfully', async () => {
      const categoryData = CategoryFixture.createCategoryDto();
      
      const response = await categoriesClient.createCategory(categoryData);
      
      expect(response.status).toBe(201);
      expect(response.data).toBeTruthy();
      expect(response.data.id).toBeTruthy();
      expect(isValidCategory(response.data)).toBe(true);
      
      createdCategoryIds.push(response.data.id);
    });

    test('should fail to create category with invalid data', async () => {
      const invalidData = CategoryFixture.createInvalidCategory().withoutName;
      
      try {
        await categoriesClient.createCategory(invalidData);
        throw new Error('Should have thrown an error');
      } catch (error: any) {
        expect(error.status || error.response?.status).toBe(400);
      }
    });
  });

  test.describe('Get Categories', () => {
    test('should get all categories', async () => {
      const response = await categoriesClient.getAllCategories();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(isValidCategoryList(response.data)).toBe(true);
    });

    test('should get category by ID', async () => {
      // Create a category first
      const categoryData = CategoryFixture.createCategoryDto();
      const createResponse = await categoriesClient.createCategory(categoryData);
      createdCategoryIds.push(createResponse.data.id);
      
      const response = await categoriesClient.getCategoryById(createResponse.data.id);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(createResponse.data.id);
      expect(isValidCategory(response.data)).toBe(true);
    });

    test('should get root categories', async () => {
      const response = await categoriesClient.getRootCategories();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(isValidCategoryList(response.data)).toBe(true);
    });
  });

  test.describe('Update Category', () => {
    test('should update category successfully', async () => {
      // Create a category first
      const categoryData = CategoryFixture.createCategoryDto();
      const createResponse = await categoriesClient.createCategory(categoryData);
      createdCategoryIds.push(createResponse.data.id);
      
      const updateData = CategoryFixture.updateCategoryDto({ name: 'Updated Category' });
      const response = await categoriesClient.updateCategory(createResponse.data.id, updateData);
      
      expect(response.status).toBe(200);
      expect(response.data.name).toBe('Updated Category');
      expect(isValidCategory(response.data)).toBe(true);
    });
  });

  test.describe('Delete Category', () => {
    test('should delete category successfully', async () => {
      // Create a category first
      const categoryData = CategoryFixture.createCategoryDto();
      const createResponse = await categoriesClient.createCategory(categoryData);
      
      const response = await categoriesClient.deleteCategory(createResponse.data.id);
      
      expect(response.status).toBe(204);
    });
  });
});