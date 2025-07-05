import { test, expect } from '@playwright/test';
import { UsersClient } from '../../api/ecommerce_api/UsersClient';
import { UserFixture } from '../../fixtures/ecommerce_fixtures/user.fixture';
import { isValidUser, isValidUserList } from '../../schemas/ecommerce_schemas/user.schema';

test.describe('Users API', () => {
  let usersClient: UsersClient;
  let createdUserIds: string[] = [];

  test.beforeAll(async () => {
    usersClient = new UsersClient();
    await usersClient.init();
  });

  test.afterAll(async () => {
    // Cleanup created users
    for (const userId of createdUserIds) {
      try {
        await usersClient.deleteUser(userId);
      } catch (error) {
        console.warn(`Failed to cleanup user ${userId}:`, error);
      }
    }
    await usersClient.dispose();
  });

  test.describe('Create User', () => {
    test('should create a user successfully', async () => {
      const userData = UserFixture.createUserDto();
      
      const response = await usersClient.createUser(userData);
      
      expect(response.status).toBe(201);
      expect(response.data).toBeTruthy();
      expect(response.data.id).toBeTruthy();
      expect(isValidUser(response.data)).toBe(true);
      
      createdUserIds.push(response.data.id);
    });

    test('should fail to create user with invalid email', async () => {
      const invalidData = UserFixture.createInvalidUser().withInvalidEmail;
      
      try {
        await usersClient.createUser(invalidData);
        throw new Error('Should have thrown an error');
      } catch (error: any) {
        expect(error.status || error.response?.status).toBe(400);
      }
    });
  });

  test.describe('Get Users', () => {
    test('should get all users', async () => {
      const response = await usersClient.getAllUsers();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(isValidUserList(response.data)).toBe(true);
    });

    test('should get user by ID', async () => {
      // Create a user first
      const userData = UserFixture.createUserDto();
      const createResponse = await usersClient.createUser(userData);
      createdUserIds.push(createResponse.data.id);
      
      const response = await usersClient.getUserById(createResponse.data.id);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(createResponse.data.id);
      expect(isValidUser(response.data)).toBe(true);
    });
  });

  test.describe('Update User', () => {
    test('should update user successfully', async () => {
      // Create a user first
      const userData = UserFixture.createUserDto();
      const createResponse = await usersClient.createUser(userData);
      createdUserIds.push(createResponse.data.id);
      
      const updateData = UserFixture.updateUserDto({ firstName: 'Updated Name' });
      const response = await usersClient.updateUser(createResponse.data.id, updateData);
      
      expect(response.status).toBe(200);
      expect(response.data.firstName).toBe('Updated Name');
      expect(isValidUser(response.data)).toBe(true);
    });
  });

  test.describe('Delete User', () => {
    test('should delete user successfully', async () => {
      // Create a user first
      const userData = UserFixture.createUserDto();
      const createResponse = await usersClient.createUser(userData);
      
      const response = await usersClient.deleteUser(createResponse.data.id);
      
      expect(response.status).toBe(204);
    });
  });
});