import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { categoriesClient, handleApiResponse, getLastResponse, getLastError, storeCreatedEntity } from '../hooks';
import { CategoryFixture } from '../../fixtures/ecommerce_features/category.fixture';
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
  const response = await categoriesClient.createCategory(this.existingCategory);
  expect(response.status).toBe(201);
  
  this.categoryId = response.data.id;
  storeCreatedEntity('category', this.categoryId, response.data);
});

Given('multiple categories exist in the system', async function () {
  this.createdCategories = [];
  
  for (let i = 0; i < 3; i++) {
    const categoryData = CategoryFixture.createCategoryDto();
    const response = await categoriesClient.createCategory(categoryData);
    expect(response.status).toBe(201);
    
    this.createdCategories.push(response.data);
    storeCreatedEntity('category', response.data.id, response.data);
  }
});

Given('root categories exist in the system', async function () {
  this.rootCategories = [];
  
  for (let i = 0; i < 2; i++) {
    const categoryData = CategoryFixture.createRootCategory();
    const response = await categoriesClient.createCategory(categoryData);
    expect(response.status).toBe(201);
    
    this.rootCategories.push(response.data);
    storeCreatedEntity('category', response.data.id, response.data);
  }
});

Given('a parent category with children exists', async function () {
  // Create parent category
  const parentData = CategoryFixture.createRootCategory();
  const parentResponse = await categoriesClient.createCategory(parentData);
  expect(parentResponse.status).toBe(201);
  
  this.parentCategoryId = parentResponse.data.id;
  storeCreatedEntity('category', this.parentCategoryId, parentResponse.data);
  
  // Create child categories
  this.childCategories = [];
  for (let i = 0; i < 2; i++) {
    const childData = CategoryFixture.createChildCategory(this.parentCategoryId);
    const childResponse = await categoriesClient.createCategory(childData);
    expect(childResponse.status).toBe(201);
    
    this.childCategories.push(childResponse.data);
    storeCreatedEntity('category', childResponse.data.id, childResponse.data);
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
    
    if (response.status === 201 && response.data?.id) {
      storeCreatedEntity('category', response.data.id, response.data);
    }
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I create a parent category', async function () {
  try {
    const response = await categoriesClient.createCategory(this.parentCategoryData);
    handleApiResponse(response);
    
    if (response.status === 201 && response.data?.id) {
      this.parentCategoryId = response.data.id;
      storeCreatedEntity('category', response.data.id, response.data);
    }
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I create a child category', async function () {
  try {
    const response = await categoriesClient.createCategory(this.childCategoryData);
    handleApiResponse(response);
    
    if (response.status === 201 && response.data?.id) {
      storeCreatedEntity('category', response.data.id, response.data);
    }
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I get all categories', async function () {
  try {
    const response = await categoriesClient.getAllCategories();
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I get the category by ID', async function () {
  try {
    const response = await categoriesClient.getCategoryById(this.categoryId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I get a category with ID {string}', async function (categoryId: string) {
  try {
    const response = await categoriesClient.getCategoryById(categoryId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I get root categories', async function () {
  try {
    const response = await categoriesClient.getRootCategories();
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I get child categories for the parent', async function () {
  try {
    const response = await categoriesClient.getChildCategories(this.parentCategoryId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I update the category', async function () {
  this.updateData = CategoryFixture.updateCategoryDto();
  
  try {
    const response = await categoriesClient.updateCategory(this.categoryId, this.updateData);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I update the category with {string} set to {string}', async function (field: string, value: string) {
  this.updateData = { [field]: value === 'true' ? true : value === 'false' ? false : value };
  
  try {
    const response = await categoriesClient.updateCategory(this.categoryId, this.updateData);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I delete the category', async function () {
  try {
    const response = await categoriesClient.deleteCategory(this.categoryId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

// Then steps
Then('the category should be created successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(201);
  expect(response.data).toBeTruthy();
  expect(response.data.id).toBeTruthy();
  
  // Validate response schema
  expect(isValidCategory(response.data)).toBe(true);
});

Then('I should get a list of categories', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(Array.isArray(response.data)).toBe(true);
  
  // Validate response schema
  expect(isValidCategoryList(response.data)).toBe(true);
});

Then('I should get the category details', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();
  expect(response.data.id).toBe(this.categoryId);
  
  // Validate response schema
  expect(isValidCategory(response.data)).toBe(true);
});

Then('I should get categories without parent', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(Array.isArray(response.data)).toBe(true);
  
  // All categories should not have a parent ID
  response.data.forEach((category: any) => {
    expect(category.parentId).toBeFalsy();
  });
  
  // Validate response schema
  expect(isValidCategoryList(response.data)).toBe(true);
});

Then('I should get categories with the parent ID', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(Array.isArray(response.data)).toBe(true);
  
  // All categories should have the parent ID
  response.data.forEach((category: any) => {
    expect(category.parentId).toBe(this.parentCategoryId);
  });
  
  // Validate response schema
  expect(isValidCategoryList(response.data)).toBe(true);
});

Then('the category should be updated successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();
  
  // Verify update data is reflected
  Object.keys(this.updateData).forEach(key => {
    expect(response.data[key]).toBe(this.updateData[key]);
  });
  
  // Validate response schema
  expect(isValidCategory(response.data)).toBe(true);
});

Then('the category should be deleted successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(204);
});

Then('the response should contain valid category data', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.data).toBeTruthy();
  
  // Validate response schema
  expect(isValidCategory(response.data)).toBe(true);
  
  if (!isValidCategory(response.data)) {
    const errors = getCategoryValidationErrors(response.data);
    throw new Error(`Invalid category data: ${errors.join(', ')}`);
  }
});

Then('each category should have required fields', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(Array.isArray(response.data)).toBe(true);
  
  response.data.forEach((category: any) => {
    expect(category.id).toBeTruthy();
    expect(category.name).toBeTruthy();
    expect(category.description).toBeTruthy();
    expect(typeof category.isActive).toBe('boolean');
    expect(category.createdAt).toBeTruthy();
    expect(category.updatedAt).toBeTruthy();
  });
});