@orders @smoke
Feature: Orders API
  As a user of the e-commerce API
  I want to manage orders
  So that I can process customer purchases

  Background:
    Given the API is available
    And a test user exists for orders

  @create @smoke
  Scenario: Create a new order successfully
    Given I have valid order data
    When I create an order
    Then the order should be created successfully
    And I should receive a 201 status code
    And the response should contain valid order data

  @create @negative
  Scenario Outline: Create order with invalid data
    Given I have invalid order data with missing "<field>"
    When I create an order
    Then I should receive a validation error
    And I should receive a 400 status code

    Examples:
      | field           |
      | userId          |
      | items           |
      | shippingAddress |

  @create @negative
  Scenario: Create order with empty items array
    Given I have order data with empty items array
    When I create an order
    Then I should receive a validation error
    And I should receive a 400 status code

  @read @smoke
  Scenario: Get all orders
    Given multiple orders exist in the system
    When I get all orders
    Then I should get a list of orders
    And I should receive a 200 status code
    And each order should have required fields

  @read @smoke
  Scenario: Get orders by user ID
    Given orders exist for a specific user
    When I get orders by user ID
    Then I should get orders filtered by user
    And I should receive a 200 status code

  @read @smoke
  Scenario: Get order by ID
    Given an order exists in the system
    When I get the order by ID
    Then I should get the order details
    And I should receive a 200 status code
    And the response should contain valid order data

  @read @negative
  Scenario: Get order with non-existent ID
    When I get an order with ID "non-existent-id"
    Then I should receive a not found error
    And I should receive a 404 status code

  @update @smoke
  Scenario: Update order status
    Given an order exists in the system
    When I update the order status to "confirmed"
    Then the order should be updated successfully
    And I should receive a 200 status code
    And the order status should be "confirmed"

  @update
  Scenario Outline: Update order through different statuses
    Given an order exists in the system
    When I update the order status to "<status>"
    Then the order should be updated successfully
    And I should receive a 200 status code
    And the order status should be "<status>"

    Examples:
      | status     |
      | confirmed  |
      | processing |
      | shipped    |
      | delivered  |

  @delete @smoke
  Scenario: Cancel an existing order
    Given an order exists in the system
    When I cancel the order
    Then the order should be cancelled successfully
    And I should receive a 204 status code

  @delete @negative
  Scenario: Cancel non-existent order
    When I cancel the order
    Then I should receive a not found error
    And I should receive a 404 status code

  @regression
  Scenario: Complete order lifecycle
    Given I have valid order data
    When I create an order
    Then the order should be created successfully
    When I get the order by ID
    Then I should get the order details
    When I update the order status to "confirmed"
    Then the order should be updated successfully
    When I update the order status to "shipped"
    Then the order should be updated successfully
    When I cancel the order
    Then the order should be cancelled successfully