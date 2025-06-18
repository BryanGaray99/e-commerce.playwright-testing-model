@users @smoke
Feature: Users API
  As a user of the e-commerce API
  I want to manage users
  So that I can maintain user accounts

  Background:
    Given the API is available

  @create @smoke
  Scenario: Create a new user successfully
    Given I have valid user data
    When I create a user
    Then the user should be created successfully
    And I should receive a 201 status code
    And the response should contain valid user data

  @create @negative
  Scenario Outline: Create user with invalid data
    Given I have invalid user data with missing "<field>"
    When I create a user
    Then I should receive a validation error
    And I should receive a 400 status code

    Examples:
      | field     |
      | email     |
      | firstName |
      | lastName  |
      | address   |

  @create @negative
  Scenario: Create user with invalid email format
    Given I have user data with invalid email format
    When I create a user
    Then I should receive a validation error
    And I should receive a 400 status code

  @read @smoke
  Scenario: Get all users
    Given multiple users exist in the system
    When I get all users
    Then I should get a list of users
    And I should receive a 200 status code
    And each user should have required fields

  @read @smoke
  Scenario: Get user by ID
    Given a user exists in the system
    When I get the user by ID
    Then I should get the user details
    And I should receive a 200 status code
    And the response should contain valid user data

  @read @negative
  Scenario: Get user with non-existent ID
    When I get a user with ID "non-existent-id"
    Then I should receive a not found error
    And I should receive a 404 status code

  @update @smoke
  Scenario: Update an existing user
    Given a user exists in the system
    When I update the user
    Then the user should be updated successfully
    And I should receive a 200 status code
    And the response should contain valid user data

  @update
  Scenario: Update user email
    Given a user exists in the system
    When I update the user with "email" set to "newemail@example.com"
    Then the user should be updated successfully
    And I should receive a 200 status code

  @update
  Scenario: Update user name
    Given a user exists in the system
    When I update the user with "firstName" set to "UpdatedName"
    Then the user should be updated successfully
    And I should receive a 200 status code

  @delete @smoke
  Scenario: Delete an existing user
    Given a user exists in the system
    When I delete the user
    Then the user should be deleted successfully
    And I should receive a 204 status code

  @delete @negative
  Scenario: Delete non-existent user
    When I delete the user
    Then I should receive a not found error
    And I should receive a 404 status code

  @regression
  Scenario: Complete user lifecycle
    Given I have valid user data
    When I create a user
    Then the user should be created successfully
    When I get the user by ID
    Then I should get the user details
    When I update the user
    Then the user should be updated successfully
    When I delete the user
    Then the user should be deleted successfully