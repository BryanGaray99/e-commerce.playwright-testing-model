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
  
  try {
    const response = await usersClient.createUser(this.existingUser);
    expect(response.status).toBe(201);
    
    const userData = (response.data as any)?.data?.data || response.data;
    this.userId = userData.id;
    storeCreatedEntity('user', this.userId, response.data);
  } catch (error: any) {
    console.log(`❌ Error creating user:`, error.status || 'Unknown error');
    throw error;
  }
});

Given('multiple users exist in the system', async function () {
  this.createdUsers = [];
  
  for (let i = 0; i < 3; i++) {
    const userData = UserFixture.createUserDto();
    
    try {
      const response = await usersClient.createUser(userData);
      expect(response.status).toBe(201);
      
      const createdUserData = (response.data as any)?.data?.data || response.data;
      this.createdUsers.push(createdUserData);
      storeCreatedEntity('user', createdUserData.id, response.data);
    } catch (error: any) {
      console.log(`❌ Error creating user ${i}:`, error.status || 'Unknown error');
      throw error;
    }
  }
});

// When steps
When('I create a user', async function () {
  try {
    const response = await usersClient.createUser(this.userData);
    handleApiResponse(response);
    
    if (response.status === 201 && response.data) {
      const userData = (response.data as any)?.data?.data || response.data;
      if (userData?.id) {
        this.userId = userData.id;
        storeCreatedEntity('user', userData.id, response.data);
      }
    }
  } catch (error: any) {
    console.log(`❌ Error creating user:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I get all users', async function () {
  try {
    const response = await usersClient.getAllUsers();
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error getting all users:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I get the user by ID', async function () {
  try {
    const response = await usersClient.getUserById(this.userId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error getting user ${this.userId}:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I get a user with ID {string}', async function (userId: string) {
  try {
    const response = await usersClient.getUserById(userId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error getting user ${userId}:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I update the user', async function () {
  this.updateData = UserFixture.updateUserDto();
  
  try {
    const response = await usersClient.updateUser(this.userId, this.updateData);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error updating user:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I update the user with {string} set to {string}', async function (field: string, value: string) {
  this.updateData = { [field]: value };
  
  try {
    const response = await usersClient.updateUser(this.userId, this.updateData);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error updating user with ${field}:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

When('I delete the user', async function () {
  try {
    const response = await usersClient.deleteUser(this.userId);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error deleting user:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

// Then steps
Then('the user should be created successfully', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ User creation failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(201);
  expect(response.data).toBeTruthy();
  
  const userData = (response.data as any)?.data?.data || response.data;
  expect(userData.id).toBeTruthy();
  
  // Validate response schema
  expect(isValidUser(userData)).toBe(true);
});

Then('I should get a list of users', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Getting users failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  const usersData = (response.data as any)?.data?.data || response.data;
  expect(Array.isArray(usersData)).toBe(true);
  
  // Validate response schema
  expect(isValidUserList(usersData)).toBe(true);
});

Then('I should get the user details', function () {
  const response = getLastResponse();
  const error = getLastError();
  
  if (error) {
    console.log(`❌ Error getting user details:`, error);
  }
  
  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();
  const userData = (response.data as any)?.data?.data || response.data;
  expect(userData.id).toBe(this.userId);
  
  // Validate response schema
  expect(isValidUser(userData)).toBe(true);
});

Then('the user should be updated successfully', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Update failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();

  const userData = (response.data as any)?.data?.data || response.data;

  Object.keys(this.updateData).forEach(key => {
    let expected = this.updateData[key];
    let actual = userData[key];
    
    // Para campos que podrían ser numéricos en el futuro
    if (["age", "phone"].includes(key)) {
      expected = Number(expected);
      actual = Number(actual);
    }
    
    // Comparar address con toStrictEqual para objetos complejos
    if (key === 'address') {
      expect(actual).toStrictEqual(expected);
    } else {
      expect(actual).toBe(expected);
    }
  });

  // Validate response schema
  expect(isValidUser(userData)).toBe(true);
});

Then('the user should be deleted successfully', function () {
  const response = getLastResponse();
  const error = getLastError();
  
  if (error) {
    console.log(`❌ Delete failed:`, error);
  }
  
  expect(response).toBeTruthy();
  expect(response.status).toBe(204);
});

Then('the response should contain valid user data', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ User validation failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.data).toBeTruthy();
  const userData = (response.data as any)?.data?.data || response.data;
  
  // Validate response schema
  expect(isValidUser(userData)).toBe(true);
  
  if (!isValidUser(userData)) {
    const errors = getUserValidationErrors(userData);
    throw new Error(`Invalid user data: ${errors.join(', ')}`);
  }
});

Then('each user should have required fields', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ User fields validation failed:`, error);
  }

  expect(response).toBeTruthy();
  const usersData = (response.data as any)?.data?.data || response.data;
  expect(Array.isArray(usersData)).toBe(true);
  
  usersData.forEach((user: any) => {
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