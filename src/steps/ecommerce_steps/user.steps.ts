import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { usersClient, handleApiResponse, getLastResponse, getLastError, storeCreatedEntity } from '../hooks';
import { UserFixture } from '../../fixtures/ecommerce_features/user.fixture';
import { isValidUser, isValidUserList, getUserValidationErrors } from '../../schemas/ecommerce_schemas/user.schema';

/**
 * User BDD step definitions
 */

// Given steps
Given('I have valid user data', function () {
  this.userData = UserFixture.createUserDto();
});

Given('I have invalid user data with missing {string}', function (field: string) {
  this.userData = UserFixture.createUserDto();
  delete this.userData[field];
});

Given('I have user data with invalid email format', function () {
  this.userData = UserFixture.createInvalidUser().withInvalidEmail;
});

Given('a user exists in the system', async function () {
  this.existingUser = UserFixture.createUserDto();
  const response = await usersClient.createUser(this.existingUser);
  expect(response.status).toBe(201);
  
  this.userId = response.data.id;
  storeCreatedEntity('user', this.userId, response.data);
});

Given('multiple users exist in the system', async function () {
  this.createdUsers = [];
  
  for (let i = 0; i < 3; i++) {
    const userData = UserFixture.createUserDto();
    const response = await usersClient.createUser(userData);
    expect(response.status).toBe(201);
    
    this.createdUsers.push(response.data);
    storeCreatedEntity('user', response.data.id, response.data);
  }
});

// When steps
When('I create a user', async function () {
  try {
    const response = await usersClient.createUser(this.userData);
    handleApiResponse(response);
    
    if (response.status === 201 && response.data?.id) {
      storeCreatedEntity('user', response.data.id, response.data);
    }
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I get all users', async function () {
  try {
    const response = await usersClient.getAllUsers();
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I get the user by ID', async function () {
  try {
    const response = await usersClient.getUserById(this.userId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I get a user with ID {string}', async function (userId: string) {
  try {
    const response = await usersClient.getUserById(userId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I update the user', async function () {
  this.updateData = UserFixture.updateUserDto();
  
  try {
    const response = await usersClient.updateUser(this.userId, this.updateData);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I update the user with {string} set to {string}', async function (field: string, value: string) {
  this.updateData = { [field]: value };
  
  try {
    const response = await usersClient.updateUser(this.userId, this.updateData);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

When('I delete the user', async function () {
  try {
    const response = await usersClient.deleteUser(this.userId);
    handleApiResponse(response);
  } catch (error) {
    handleApiResponse(null, error);
  }
});

// Then steps
Then('the user should be created successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(201);
  expect(response.data).toBeTruthy();
  expect(response.data.id).toBeTruthy();
  
  // Validate response schema
  expect(isValidUser(response.data)).toBe(true);
});

Then('I should get a list of users', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(Array.isArray(response.data)).toBe(true);
  
  // Validate response schema
  expect(isValidUserList(response.data)).toBe(true);
});

Then('I should get the user details', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();
  expect(response.data.id).toBe(this.userId);
  
  // Validate response schema
  expect(isValidUser(response.data)).toBe(true);
});

Then('the user should be updated successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();
  
  // Verify update data is reflected
  Object.keys(this.updateData).forEach(key => {
    expect(response.data[key]).toBe(this.updateData[key]);
  });
  
  // Validate response schema
  expect(isValidUser(response.data)).toBe(true);
});

Then('the user should be deleted successfully', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.status).toBe(204);
});

Then('the response should contain valid user data', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(response.data).toBeTruthy();
  
  // Validate response schema
  expect(isValidUser(response.data)).toBe(true);
  
  if (!isValidUser(response.data)) {
    const errors = getUserValidationErrors(response.data);
    throw new Error(`Invalid user data: ${errors.join(', ')}`);
  }
});

Then('each user should have required fields', function () {
  const response = getLastResponse();
  expect(response).toBeTruthy();
  expect(Array.isArray(response.data)).toBe(true);
  
  response.data.forEach((user: any) => {
    expect(user.id).toBeTruthy();
    expect(user.email).toBeTruthy();
    expect(user.firstName).toBeTruthy();
    expect(user.lastName).toBeTruthy();
    expect(user.address).toBeTruthy();
    expect(typeof user.isActive).toBe('boolean');
    expect(user.createdAt).toBeTruthy();
    expect(user.updatedAt).toBeTruthy();
  });
});