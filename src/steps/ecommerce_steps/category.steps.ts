import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { categoriesClient, handleApiResponse, getLastResponse, getLastError, storeCreatedEntity } from '../hooks';
import { CategoryFixture } from '../../fixtures/ecommerce_fixtures/category.fixture';
import { isValidCategory, isValidCategoryList, getCategoryValidationErrors } from '../../schemas/ecommerce_schemas/category.schema';

/**
 * Category BDD step definitions
 */

// Given steps
Given('I have valid category data', function () {
  this.categoryData = CategoryFixture.createCategoryDto();
});

Given('I have invalid category data with missing {string}', function (field: string) {
  this.categoryData = CategoryFixture.createCategoryDto();
  delete this.categoryData[field];
});

Given('I have category data with name too short', function () {
  this.categoryData = CategoryFixture.createInvalidCategory().withShortName;
});

Given('a category exists in the system', async function () {
  this.existingCategory = CategoryFixture.createCategoryDto();
  
  try {
    const response = await categoriesClient.createCategory(this.existingCategory);
    expect(response.status).toBe(201);
    
    const categoryData = (response.data as any)?.data?.data || response.data;
    this.categoryId = categoryData.id;
    storeCreatedEntity('category', this.categoryId, response.data);
  } catch (error: any) {
    console.log(`❌ Error creating category:`, error.status || 'Unknown error');
    throw error;
  }
});

Given('multiple categories exist in the system', async function () {
  this.createdCategories = [];
  
  for (let i = 0; i < 3; i++) {
    const categoryData = CategoryFixture.createCategoryDto();
    
    try {
      const response = await categoriesClient.createCategory(categoryData);
      expect(response.status).toBe(201);
      
      const categoryDataResponse = (response.data as any)?.data?.data || response.data;
      this.createdCategories.push(categoryDataResponse);
      storeCreatedEntity('category', categoryDataResponse.id, response.data);
    } catch (error: any) {
      console.log(`❌ Error creating category ${i}:`, error.status || 'Unknown error');
      throw error;
    }
  }
});

Given('root categories exist in the system', async function () {
  this.rootCategories = [];
  
  for (let i = 0; i < 2; i++) {
    const categoryData = CategoryFixture.createRootCategory();
    
    try {
      const response = await categoriesClient.createCategory(categoryData);
      expect(response.status).toBe(201);
      
      const categoryDataResponse = (response.data as any)?.data?.data || response.data;
      this.rootCategories.push(categoryDataResponse);
      storeCreatedEntity('category', categoryDataResponse.id, response.data);
    } catch (error: any) {
      console.log(`❌ Error creating root category ${i}:`, error.status || 'Unknown error');
      throw error;
    }
  }
});

Given('a parent category with children exists', async function () {
  // Create parent category
  const parentData = CategoryFixture.createRootCategory();
  
  try {
    const parentResponse = await categoriesClient.createCategory(parentData);
    expect(parentResponse.status).toBe(201);
    
    const parentDataResponse = (parentResponse.data as any)?.data?.data || parentResponse.data;
    this.parentCategoryId = parentDataResponse.id;
    storeCreatedEntity('category', this.parentCategoryId, parentResponse.data);
    
    // Create child categories
    this.childCategories = [];
    for (let i = 0; i < 2; i++) {
      const childData = CategoryFixture.createChildCategory(this.parentCategoryId);
      const childResponse = await categoriesClient.createCategory(childData);
      expect(childResponse.status).toBe(201);
      
      const childDataResponse = (childResponse.data as any)?.data?.data || childResponse.data;
      this.childCategories.push(childDataResponse);
      storeCreatedEntity('category', childDataResponse.id, childResponse.data);
    }
  } catch (error: any) {
    console.log(`❌ Error creating parent/child categories:`, error.status || 'Unknown error');
    throw error;
  }
});

Given('I have valid parent category data', function () {
  this.parentCategoryData = CategoryFixture.createRootCategory();
});

Given('I have valid child category data with parent ID', function () {
  this.childCategoryData = CategoryFixture.createChildCategory(this.parentCategoryId);
});

// When steps
When('I create a category', async function () {
  try {
    const response = await categoriesClient.createCategory(this.categoryData);
    handleApiResponse(response);
    
    if (response.status === 201 && response.data) {
      const categoryData = (response.data as any)?.data?.data || response.data;
      if (categoryData?.id) {
        this.categoryId = categoryData.id;
        storeCreatedEntity('category', categoryData.id, response.data);
      }
    }
  } catch (error: any) {
    console.log(`❌ Error creating category:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I create a parent category', async function () {
  try {
    const response = await categoriesClient.createCategory(this.parentCategoryData);
    handleApiResponse(response);
    
    if (response.status === 201 && response.data) {
      const categoryData = (response.data as any)?.data?.data || response.data;
      if (categoryData?.id) {
        this.parentCategoryId = categoryData.id;
        storeCreatedEntity('category', categoryData.id, response.data);
      }
    }
  } catch (error: any) {
    console.log(`❌ Error creating parent category:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I create a child category', async function () {
  try {
    const response = await categoriesClient.createCategory(this.childCategoryData);
    handleApiResponse(response);
    
    if (response.status === 201 && response.data) {
      const categoryData = (response.data as any)?.data?.data || response.data;
      if (categoryData?.id) {
        storeCreatedEntity('category', categoryData.id, response.data);
      }
    }
  } catch (error: any) {
    console.log(`❌ Error creating child category:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I get all categories', async function () {
  try {
    const response = await categoriesClient.getAllCategories();
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error getting all categories:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I get the category by ID', async function () {
  try {
    const response = await categoriesClient.getCategoryById(this.categoryId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error getting category by ID:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I get a category with ID {string}', async function (categoryId: string) {
  try {
    const response = await categoriesClient.getCategoryById(categoryId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error getting category with ID ${categoryId}:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I get root categories', async function () {
  try {
    const response = await categoriesClient.getRootCategories();
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error getting root categories:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I get child categories for the parent', async function () {
  try {
    const response = await categoriesClient.getChildCategories(this.parentCategoryId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error getting child categories:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I update the category', async function () {
  this.updateData = CategoryFixture.updateCategoryDto();
  
  try {
    const response = await categoriesClient.updateCategory(this.categoryId, this.updateData);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error updating category:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I update the category with {string} set to {string}', async function (field: string, value: string) {
  this.updateData = { [field]: value === 'true' ? true : value === 'false' ? false : value };
  
  try {
    const response = await categoriesClient.updateCategory(this.categoryId, this.updateData);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error updating category with ${field}:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I delete the category', async function () {
  try {
    const response = await categoriesClient.deleteCategory(this.categoryId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error deleting category:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

// Then steps
Then('the category should be created successfully', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Category creation failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(201);
  expect(response.data).toBeTruthy();

  const categoryData = (response.data as any)?.data?.data || response.data;
  expect(categoryData.id).toBeTruthy();
  
  // Validate response schema
  expect(isValidCategory(categoryData)).toBe(true);
});

Then('I should get a list of categories', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Getting categories failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();

  const categoriesData = (response.data as any)?.data?.data || response.data;
  expect(Array.isArray(categoriesData)).toBe(true);
  
  // Validate response schema
  expect(isValidCategoryList(categoriesData)).toBe(true);
});

Then('I should get the category details', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Getting category details failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();

  const categoryData = (response.data as any)?.data?.data || response.data;
  expect(categoryData.id).toBe(this.categoryId);
  
  // Validate response schema
  expect(isValidCategory(categoryData)).toBe(true);
});

Then('I should get categories without parent', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Getting root categories failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();

  const categoriesData = (response.data as any)?.data?.data || response.data;
  expect(Array.isArray(categoriesData)).toBe(true);
  
  // All categories should not have a parent ID
  categoriesData.forEach((category: any) => {
    expect(category.parentId).toBeFalsy();
  });
  
  // Validate response schema
  expect(isValidCategoryList(categoriesData)).toBe(true);
});

Then('I should get categories with the parent ID', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Getting child categories failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();

  const categoriesData = (response.data as any)?.data?.data || response.data;
  expect(Array.isArray(categoriesData)).toBe(true);
  
  // All categories should have the parent ID
  categoriesData.forEach((category: any) => {
    expect(category.parentId).toBe(this.parentCategoryId);
  });
  
  // Validate response schema
  expect(isValidCategoryList(categoriesData)).toBe(true);
});

Then('the category should be updated successfully', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Category update failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();

  const categoryData = (response.data as any)?.data?.data || response.data;
  
  // Verify update data is reflected
  Object.keys(this.updateData).forEach(key => {
    expect(categoryData[key]).toBe(this.updateData[key]);
  });
  
  // Validate response schema
  expect(isValidCategory(categoryData)).toBe(true);
});

Then('the category should be deleted successfully', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Category deletion failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(204);
});

Then('the response should contain valid category data', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Category validation failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.data).toBeTruthy();

  const categoryData = (response.data as any)?.data?.data || response.data;
  
  // Validate response schema
  expect(isValidCategory(categoryData)).toBe(true);
  
  if (!isValidCategory(categoryData)) {
    const errors = getCategoryValidationErrors(categoryData);
    throw new Error(`Invalid category data: ${errors.join(', ')}`);
  }
});

Then('each category should have required fields', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Category fields validation failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.data).toBeTruthy();

  const categoriesData = (response.data as any)?.data?.data || response.data;
  expect(Array.isArray(categoriesData)).toBe(true);
  
  categoriesData.forEach((category: any) => {
    expect(category.id).toBeTruthy();
    expect(category.name).toBeTruthy();
    expect(category.description).toBeTruthy();
    expect(typeof category.isActive).toBe('boolean');
    expect(category.createdAt).toBeTruthy();
    expect(category.updatedAt).toBeTruthy();
  });
});