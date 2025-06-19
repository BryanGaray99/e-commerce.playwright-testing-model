import { faker } from '@faker-js/faker';
import { Cart, CartItem, AddItemDto, UpdateItemDto } from '../../types/ecommerce_types/cart';

/**
 * Cart test data fixtures using Faker.js
 */
export class CartFixture {
  /**
   * Generate cart item
   */
  static createCartItem(overrides: Partial<CartItem> = {}): CartItem {
    const quantity = faker.number.int({ min: 1, max: 10 });
    const price = parseFloat(faker.commerce.price({ min: 5, max: 500 }));
    const subtotal = price * quantity;
    
    return {
      productId: faker.string.uuid(),
      productName: faker.commerce.productName(),
      price,
      quantity,
      subtotal,
      ...overrides
    };
  }

  /**
   * Generate multiple cart items
   */
  static createCartItems(count: number = 3): CartItem[] {
    return Array.from({ length: count }, () => this.createCartItem());
  }

  /**
   * Calculate cart totals
   */
  static calculateCartTotals(items: CartItem[]) {
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return { totalAmount, itemCount };
  }

  /**
   * Generate a complete cart object
   */
  static createCart(overrides: Partial<Cart> = {}): Cart {
    const items = this.createCartItems();
    const { totalAmount, itemCount } = this.calculateCartTotals(items);
    
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      items,
      totalAmount,
      itemCount,
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    };
  }

  /**
   * Generate add item DTO
   */
  static createAddItemDto(overrides: Partial<AddItemDto> = {}): AddItemDto {
    return {
      productId: faker.string.uuid(),
      productName: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price({ min: 5, max: 500 })),
      quantity: faker.number.int({ min: 1, max: 5 }),
      ...overrides
    };
  }

  /**
   * Generate update item DTO
   */
  static createUpdateItemDto(overrides: Partial<UpdateItemDto> = {}): UpdateItemDto {
    return {
      quantity: faker.number.int({ min: 1, max: 10 }),
      ...overrides
    };
  }

  /**
   * Generate empty cart
   */
  static createEmptyCart(userId?: string): Cart {
    return this.createCart({
      userId: userId || faker.string.uuid(),
      items: [],
      totalAmount: 0,
      itemCount: 0
    });
  }

  /**
   * Generate cart for specific user
   */
  static createCartForUser(userId: string, overrides: Partial<Cart> = {}): Cart {
    return this.createCart({ userId, ...overrides });
  }

  /**
   * Generate cart with single item
   */
  static createSingleItemCart(overrides: Partial<Cart> = {}): Cart {
    const items = [this.createCartItem()];
    const { totalAmount, itemCount } = this.calculateCartTotals(items);
    
    return this.createCart({
      items,
      totalAmount,
      itemCount,
      ...overrides
    });
  }

  /**
   * Generate cart with high-value items
   */
  static createHighValueCart(overrides: Partial<Cart> = {}): Cart {
    const items = Array.from({ length: 3 }, () => 
      this.createCartItem({
        price: parseFloat(faker.commerce.price({ min: 200, max: 1000 })),
        quantity: faker.number.int({ min: 1, max: 3 })
      })
    );
    
    // Recalculate totals for high-value items
    items.forEach(item => {
      item.subtotal = item.price * item.quantity;
    });
    
    const { totalAmount, itemCount } = this.calculateCartTotals(items);
    
    return this.createCart({
      items,
      totalAmount,
      itemCount,
      ...overrides
    });
  }

  /**
   * Generate cart with specific product
   */
  static createCartWithProduct(productId: string, productName: string, overrides: Partial<Cart> = {}): Cart {
    const specificItem = this.createCartItem({ productId, productName });
    const otherItems = this.createCartItems(2);
    const items = [specificItem, ...otherItems];
    const { totalAmount, itemCount } = this.calculateCartTotals(items);
    
    return this.createCart({
      items,
      totalAmount,
      itemCount,
      ...overrides
    });
  }

  /**
   * Generate cart for specific testing scenarios
   */
  static createTestScenarios() {
    const userId = faker.string.uuid();
    
    return {
      empty: this.createEmptyCart(userId),
      singleItem: this.createSingleItemCart({ userId }),
      multipleItems: this.createCartForUser(userId),
      highValue: this.createHighValueCart({ userId }),
      withDuplicates: this.createCartWithDuplicateProducts(userId)
    };
  }

  /**
   * Generate cart with duplicate products (different quantities)
   */
  static createCartWithDuplicateProducts(userId: string): Cart {
    const productId = faker.string.uuid();
    const productName = faker.commerce.productName();
    
    const item1 = this.createCartItem({
      productId,
      productName,
      quantity: 2
    });
    
    const item2 = this.createCartItem({
      productId,
      productName,
      quantity: 3
    });
    
    const items = [item1, item2];
    const { totalAmount, itemCount } = this.calculateCartTotals(items);
    
    return this.createCart({
      userId,
      items,
      totalAmount,
      itemCount
    });
  }

  /**
   * Generate invalid cart data for negative testing
   */
  static createInvalidCart() {
    return {
      addItemWithoutProductId: this.createAddItemDto({ productId: undefined as any }),
      addItemWithZeroQuantity: this.createAddItemDto({ quantity: 0 }),
      addItemWithNegativeQuantity: this.createAddItemDto({ quantity: -1 }),
      addItemWithNegativePrice: this.createAddItemDto({ price: -10 }),
      updateItemWithZeroQuantity: this.createUpdateItemDto({ quantity: 0 }),
      updateItemWithNegativeQuantity: this.createUpdateItemDto({ quantity: -1 })
    };
  }

  /**
   * Generate cart workflow progression
   */
  static createCartWorkflow(userId: string) {
    const productId = faker.string.uuid();
    const productName = faker.commerce.productName();
    
    return {
      empty: this.createEmptyCart(userId),
      addItem: this.createAddItemDto({ productId, productName, quantity: 1 }),
      updateItem: this.createUpdateItemDto({ quantity: 3 }),
      finalCart: this.createCartWithProduct(productId, productName, { userId })
    };
  }
}