@cart @smoke
Feature: Cart API
  As a user of the e-commerce API
  I want to manage shopping carts
  So that users can add and manage items before purchase

  Background:
    Given the API is available
    And a test user exists for cart operations

  @read @smoke
  Scenario: Get user cart
    When I get the user cart
    Then I should get the cart details
    And I should receive a 200 status code
    And the response should contain valid cart data

  @create @smoke
  Scenario: Add item to cart successfully
    Given I have valid cart item data
    When I add the item to cart
    Then the item should be added successfully
    And I should receive a 201 status code
    And the cart should contain the item

  @create @negative
  Scenario Outline: Add item with invalid data
    Given I have invalid cart item data with missing "<field>"
    When I add the item to cart
    Then I should receive a validation error
    And I should receive a 400 status code

    Examples:
      | field       |
      | productId   |
      | productName |
      | price       |
      | quantity    |

  @create @negative
  Scenario Outline: Add item with invalid values
    Given I have cart item data with invalid "<field>"
    When I add the item to cart
    Then I should receive a validation error
    And I should receive a 400 status code

    Examples:
      | field    |
      | quantity |
      | price    |

  @update @smoke
  Scenario: Update item quantity in cart
    Given an item exists in the cart
    When I update the item quantity to 5
    Then the item should be updated successfully
    And I should receive a 200 status code
    And the item quantity should be 5

  @update @negative
  Scenario: Update item with invalid quantity
    Given an item exists in the cart
    When I update the item quantity to 0
    Then I should receive a validation error
    And I should receive a 400 status code

  @delete @smoke
  Scenario: Remove item from cart
    Given an item exists in the cart
    When I remove the item from cart
    Then the item should be removed successfully
    And I should receive a 200 status code

  @delete @negative
  Scenario: Remove non-existent item from cart
    When I remove a non-existent item from cart
    Then I should receive a not found error
    And I should receive a 404 status code

  @delete @smoke
  Scenario: Clear entire cart
    Given multiple items exist in the cart
    When I clear the cart
    Then the cart should be cleared successfully
    And I should receive a 200 status code
    And the cart should be empty

  @calculation
  Scenario: Calculate cart total correctly
    Given the cart is empty
    When I add an item with price 10.00 and quantity 2
    And I add an item with price 15.50 and quantity 1
    Then the cart total should be 35.50
    And the cart item count should be 3

  @workflow @regression
  Scenario: Complete cart workflow
    Given the cart is empty
    When I add an item to cart
    Then the item should be added successfully
    When I update the item quantity
    Then the item should be updated successfully
    When I add another item to cart
    Then the item should be added successfully
    When I remove the first item from cart
    Then the item should be removed successfully
    When I clear the cart
    Then the cart should be cleared successfully

  @multiple-items
  Scenario: Manage multiple items in cart
    Given the cart is empty
    When I add multiple different items to cart
    Then all items should be added successfully
    When I update quantities of multiple items
    Then all items should be updated successfully
    When I remove some items from cart
    Then the specified items should be removed
    And the remaining items should still be in cart