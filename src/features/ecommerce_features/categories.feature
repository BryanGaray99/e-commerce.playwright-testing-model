@categories @smoke
Feature: Categories API
  As a user of the e-commerce API
  I want to manage categories
  So that I can organize products effectively

  Background:
    Given the API is available

  @create @smoke
  Scenario: Create a new category successfully
    Given I have valid category data
    When I create a category
    Then the category should be created successfully
    And I should receive a 201 status code
    And the response should contain valid category data

  @create @negative
  Scenario Outline: Create category with invalid data
    Given I have invalid category data with missing "<field>"
    When I create a category
    Then I should receive a validation error
    And I should receive a 422 status code

    Examples:
      | field       |
      | name        |
      | description |

  @create @negative
  Scenario: Create category with invalid name length
    Given I have category data with name too short
    When I create a category
    Then I should receive a validation error
    And I should receive a 422 status code

  @read @smoke
  Scenario: Get all categories
    Given multiple categories exist in the system
    When I get all categories
    Then I should get a list of categories
    And I should receive a 200 status code
    And each category should have required fields

  @read @smoke
  Scenario: Get category by ID
    Given a category exists in the system
    When I get the category by ID
    Then I should get the category details
    And I should receive a 200 status code
    And the response should contain valid category data

  @read @negative
  Scenario: Get category with non-existent ID
    When I get a category with ID "non-existent-id"
    Then I should receive a not found error
    And I should receive a 404 status code

  @read
  Scenario: Get root categories
    Given root categories exist in the system
    When I get root categories
    Then I should get categories without parent
    And I should receive a 200 status code

  @read
  Scenario: Get child categories
    Given a parent category with children exists
    When I get child categories for the parent
    Then I should get categories with the parent ID
    And I should receive a 200 status code

  @update @smoke
  Scenario: Update an existing category
    Given a category exists in the system
    When I update the category
    Then the category should be updated successfully
    And I should receive a 200 status code
    And the response should contain valid category data

  @update
  Scenario: Update category name
    Given a category exists in the system
    When I update the category with "name" set to "Updated Category Name"
    Then the category should be updated successfully
    And I should receive a 200 status code

  @update
  Scenario: Update category status
    Given a category exists in the system
    When I update the category with "isActive" set to "false"
    Then the category should be updated successfully
    And I should receive a 200 status code

  @delete @smoke
  Scenario: Delete an existing category
    Given a category exists in the system
    When I delete the category
    Then the category should be deleted successfully
    And I should receive a 204 status code

  @delete @negative
  Scenario: Delete non-existent category
    When I delete the category
    Then I should receive a not found error
    And I should receive a 404 status code

  @regression
  Scenario: Complete category lifecycle
    Given I have valid category data
    When I create a category
    Then the category should be created successfully
    When I get the category by ID
    Then I should get the category details
    When I update the category
    Then the category should be updated successfully
    When I delete the category
    Then the category should be deleted successfully

  @hierarchy
  Scenario: Create category hierarchy
    Given I have valid parent category data
    When I create a parent category
    Then the category should be created successfully
    Given I have valid child category data with parent ID
    When I create a child category
    Then the category should be created successfully
    When I get child categories for the parent
    Then I should get categories with the parent ID