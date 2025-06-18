import { faker } from '@faker-js/faker';
import { Order, CreateOrderDto, UpdateOrderDto, OrderItem, OrderItemDto } from '../../types/ecommerce_types/order';
import { Address, OrderStatus } from '../../types/common';
import { UserFixture } from './user.fixture';

/**
 * Order test data fixtures using Faker.js
 */
export class OrderFixture {
  /**
   * Generate order item
   */
  static createOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
    const quantity = faker.number.int({ min: 1, max: 5 });
    const price = parseFloat(faker.commerce.price({ min: 10, max: 500 }));
    
    return {
      productId: faker.string.uuid(),
      productName: faker.commerce.productName(),
      quantity,
      price,
      ...overrides
    };
  }

  /**
   * Generate order item DTO
   */
  static createOrderItemDto(overrides: Partial<OrderItemDto> = {}): OrderItemDto {
    const quantity = faker.number.int({ min: 1, max: 5 });
    const price = parseFloat(faker.commerce.price({ min: 10, max: 500 }));
    
    return {
      productId: faker.string.uuid(),
      productName: faker.commerce.productName(),
      quantity,
      price,
      ...overrides
    };
  }

  /**
   * Generate multiple order items
   */
  static createOrderItems(count: number = 3): OrderItem[] {
    return Array.from({ length: count }, () => this.createOrderItem());
  }

  /**
   * Generate multiple order item DTOs
   */
  static createOrderItemDtos(count: number = 3): OrderItemDto[] {
    return Array.from({ length: count }, () => this.createOrderItemDto());
  }

  /**
   * Calculate total from items
   */
  static calculateTotal(items: OrderItem[] | OrderItemDto[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Generate a complete order object
   */
  static createOrder(overrides: Partial<Order> = {}): Order {
    const items = this.createOrderItems();
    const totalAmount = this.calculateTotal(items);
    
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      items,
      status: faker.helpers.arrayElement(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]),
      totalAmount,
      shippingAddress: UserFixture.createAddress(),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    };
  }

  /**
   * Generate order creation data
   */
  static createOrderDto(overrides: Partial<CreateOrderDto> = {}): CreateOrderDto {
    const items = this.createOrderItemDtos();
    
    return {
      userId: faker.string.uuid(),
      items,
      shippingAddress: UserFixture.createAddress(),
      ...overrides
    };
  }

  /**
   * Generate order update data
   */
  static updateOrderDto(overrides: Partial<UpdateOrderDto> = {}): UpdateOrderDto {
    return {
      status: faker.helpers.arrayElement(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]),
      ...overrides
    };
  }

  /**
   * Generate multiple orders
   */
  static createOrders(count: number = 10, overrides: Partial<Order> = {}): Order[] {
    return Array.from({ length: count }, () => this.createOrder(overrides));
  }

  /**
   * Generate order for specific user
   */
  static createOrderForUser(userId: string, overrides: Partial<Order> = {}): Order {
    return this.createOrder({ userId, ...overrides });
  }

  /**
   * Generate order with specific status
   */
  static createOrderWithStatus(status: OrderStatus, overrides: Partial<Order> = {}): Order {
    return this.createOrder({ status, ...overrides });
  }

  /**
   * Generate single item order
   */
  static createSingleItemOrder(overrides: Partial<Order> = {}): Order {
    const items = [this.createOrderItem()];
    const totalAmount = this.calculateTotal(items);
    
    return this.createOrder({ items, totalAmount, ...overrides });
  }

  /**
   * Generate high-value order
   */
  static createHighValueOrder(overrides: Partial<Order> = {}): Order {
    const items = Array.from({ length: 5 }, () => 
      this.createOrderItem({ 
        price: parseFloat(faker.commerce.price({ min: 200, max: 1000 })),
        quantity: faker.number.int({ min: 2, max: 3 })
      })
    );
    const totalAmount = this.calculateTotal(items);
    
    return this.createOrder({ items, totalAmount, ...overrides });
  }

  /**
   * Generate order for specific testing scenarios
   */
  static createTestScenarios() {
    return {
      pending: this.createOrderWithStatus('pending'),
      confirmed: this.createOrderWithStatus('confirmed'),
      processing: this.createOrderWithStatus('processing'),
      shipped: this.createOrderWithStatus('shipped'),
      delivered: this.createOrderWithStatus('delivered'),
      cancelled: this.createOrderWithStatus('cancelled'),
      singleItem: this.createSingleItemOrder(),
      highValue: this.createHighValueOrder(),
      multipleItems: this.createOrder()
    };
  }

  /**
   * Generate invalid order data for negative testing
   */
  static createInvalidOrder() {
    return {
      withoutUserId: this.createOrderDto({ userId: undefined as any }),
      withoutItems: this.createOrderDto({ items: [] }),
      withoutShippingAddress: this.createOrderDto({ shippingAddress: undefined as any }),
      withInvalidQuantity: this.createOrderDto({
        items: [this.createOrderItemDto({ quantity: 0 })]
      }),
      withNegativePrice: this.createOrderDto({
        items: [this.createOrderItemDto({ price: -10 })]
      })
    };
  }

  /**
   * Generate order workflow progression
   */
  static createOrderWorkflow(userId: string) {
    const baseOrder = this.createOrderForUser(userId);
    
    return {
      created: { ...baseOrder, status: 'pending' as OrderStatus },
      confirmed: { ...baseOrder, status: 'confirmed' as OrderStatus },
      processing: { ...baseOrder, status: 'processing' as OrderStatus },
      shipped: { ...baseOrder, status: 'shipped' as OrderStatus },
      delivered: { ...baseOrder, status: 'delivered' as OrderStatus },
      cancelled: { ...baseOrder, status: 'cancelled' as OrderStatus }
    };
  }
}