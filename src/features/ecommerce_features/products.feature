@products @smoke
Feature: Products API
  As a user of the e-commerce API
  I want to manage products
  So that I can maintain the product catalog

  Background:
    Given the API is available

  @create @smoke
  Scenario: Create a new product successfully
    Given I have valid product data
    When I create a product
    Then the product should be created successfully
    And I should receive a 201 status code
    And the response should contain valid product data

  @create @negative
  Scenario Outline: Create product with invalid data
    Given I have invalid product data with missing "<field>"
    When I create a product
    Then I should receive a validation error
    And I should receive a 422 status code

    Examples:
      | field       |
      | name        |
      | description |
      | price       |
      | categoryId  |
      | stock       |

  @create @negative
  Scenario Outline: Create product with invalid field values
    Given I have product data with invalid "<field>"
    When I create a product
    Then I should receive a validation error
    And I should receive a 422 status code

    Examples:
      | field |
      | price |
      | stock |
      | name  |

  @read @smoke
  Scenario: Get all products
    Given multiple products exist in the system
    When I get all products
    Then I should get a list of products
    And I should receive a 200 status code
    And each product should have required fields

  @read @smoke
  Scenario: Get products by category
    Given a product with category "electronics-123" exists
    When I get products by category "electronics-123"
    Then I should get products filtered by category
    And I should receive a 200 status code

  @read @smoke
  Scenario: Get product by ID
    Given a product exists in the system
    When I get the product by ID
    Then I should get the product details
    And I should receive a 200 status code
    And the response should contain valid product data

  @read @negative
  Scenario: Get product with non-existent ID
    When I get a product with ID "non-existent-id"
    Then I should receive a not found error
    And I should receive a 404 status code

  @update @smoke
  Scenario: Update an existing product
    Given a product exists in the system
    When I update the product
    Then the product should be updated successfully
    And I should receive a 200 status code
    And the response should contain valid product data

  @update
  Scenario: Update product name
    Given a product exists in the system
    When I update the product with "name" set to "Updated Product Name"
    Then the product should be updated successfully
    And I should receive a 200 status code

  @update
  Scenario: Update product price
    Given a product exists in the system
    When I update the product with "price" set to "99.99"
    Then the product should be updated successfully
    And I should receive a 200 status code

  @update @negative
  Scenario: Update non-existent product
    Given I have valid product data
    When I update the product with "name" set to "Updated Name"
    Then I should receive a not found error
    And I should receive a 404 status code

  @delete @smoke
  Scenario: Delete an existing product
    Given a product exists in the system
    When I delete the product
    Then the product should be deleted successfully
    And I should receive a 204 status code

  @delete @negative
  Scenario: Delete non-existent product
    When I delete the product
    Then I should receive a not found error
    And I should receive a 404 status code

  @regression
  Scenario: Complete product lifecycle
    Given I have valid product data
    When I create a product
    Then the product should be created successfully
    When I get the product by ID
    Then I should get the product details
    When I update the product
    Then the product should be updated successfully
    When I delete the product
    Then the product should be deleted successfully