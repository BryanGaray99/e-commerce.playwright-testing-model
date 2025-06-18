import { faker } from '@faker-js/faker';
import { Product, CreateProductDto, UpdateProductDto } from '../../types/ecommerce_types/product';

/**
 * Product test data fixtures using Faker.js
 */
export class ProductFixture {
  /**
   * Generate a complete product object
   */
  static createProduct(overrides: Partial<Product> = {}): Product {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.number.float({ min: 10, max: 2000, multipleOf: 0.01 }),
      categoryId: faker.string.uuid(),
      stock: faker.number.int({ min: 0, max: 1000 }),
      imageUrl: faker.image.url(),
      isActive: faker.datatype.boolean({ probability: 0.8 }),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    };
  }

  /**
   * Generate product creation data
   */
  static createProductDto(overrides: Partial<CreateProductDto> = {}): CreateProductDto {
    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.number.float({ min: 10, max: 2000, multipleOf: 0.01 }),
      categoryId: faker.string.uuid(),
      stock: faker.number.int({ min: 1, max: 1000 }),
      imageUrl: faker.image.url(),
      isActive: true,
      ...overrides
    };
  }

  /**
   * Generate product update data
   */
  static updateProductDto(overrides: Partial<UpdateProductDto> = {}): UpdateProductDto {
    const updates: UpdateProductDto = {};
    
    // Randomly include some fields
    if (faker.datatype.boolean()) updates.name = faker.commerce.productName();
    if (faker.datatype.boolean()) updates.description = faker.commerce.productDescription();
    if (faker.datatype.boolean()) updates.price = faker.number.float({ min: 10, max: 2000, multipleOf: 0.01 });
    if (faker.datatype.boolean()) updates.stock = faker.number.int({ min: 0, max: 1000 });
    if (faker.datatype.boolean()) updates.imageUrl = faker.image.url();
    if (faker.datatype.boolean()) updates.isActive = faker.datatype.boolean();

    return { ...updates, ...overrides };
  }

  /**
   * Generate multiple products
   */
  static createProducts(count: number = 10, overrides: Partial<Product> = {}): Product[] {
    return Array.from({ length: count }, () => this.createProduct(overrides));
  }

  /**
   * Generate product with specific category
   */
  static createProductWithCategory(categoryId: string, overrides: Partial<Product> = {}): Product {
    return this.createProduct({ categoryId, ...overrides });
  }

  /**
   * Generate out of stock product
   */
  static createOutOfStockProduct(overrides: Partial<Product> = {}): Product {
    return this.createProduct({ stock: 0, ...overrides });
  }

  /**
   * Generate high-value product
   */
  static createHighValueProduct(overrides: Partial<Product> = {}): Product {
    return this.createProduct({
      price: faker.number.float({ min: 1000, max: 5000, multipleOf: 0.01 }),
      ...overrides
    });
  }

  /**
   * Generate inactive product
   */
  static createInactiveProduct(overrides: Partial<Product> = {}): Product {
    return this.createProduct({ isActive: false, ...overrides });
  }

  /**
   * Generate product for specific testing scenarios
   */
  static createTestScenarios() {
    return {
      valid: this.createProduct(),
      outOfStock: this.createOutOfStockProduct(),
      inactive: this.createInactiveProduct(),
      highValue: this.createHighValueProduct(),
      withMinimalData: this.createProduct({
        name: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        stock: 5
      })
    };
  }

  /**
   * Generate invalid product data for negative testing
   */
  static createInvalidProduct() {
    return {
      withoutName: this.createProductDto({ name: undefined as any }),
      withNegativePrice: this.createProductDto({ price: -10 }),
      withNegativeStock: this.createProductDto({ stock: -5 }),
      withEmptyName: this.createProductDto({ name: '' }),
      withShortName: this.createProductDto({ name: 'A' })
    };
  }

  /**
   * Generate invalid product data for testing validation
   */
  static createInvalidProductData(field: string): Partial<CreateProductDto> {
    const baseData = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.number.float({ min: 10, max: 2000, multipleOf: 0.01 }),
      categoryId: faker.string.uuid(),
      stock: faker.number.int({ min: 1, max: 1000 }),
      imageUrl: faker.image.url(),
      isActive: true
    };

    switch (field) {
      case 'name':
        return { ...baseData, name: '' };
      case 'description':
        return { ...baseData, description: '' };
      case 'price':
        return { ...baseData, price: -10 };
      case 'categoryId':
        return { ...baseData, categoryId: '' };
      case 'stock':
        return { ...baseData, stock: -5 };
      default:
        return baseData;
    }
  }

  /**
   * Generate product data with invalid field values
   */
  static createProductDataWithInvalidField(field: string): Partial<CreateProductDto> {
    const baseData = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.number.float({ min: 1000, max: 5000, multipleOf: 0.01 }),
      categoryId: faker.string.uuid(),
      stock: faker.number.int({ min: 1, max: 1000 }),
      imageUrl: faker.image.url(),
      isActive: true
    };

    switch (field) {
      case 'price':
        return { ...baseData, price: -100 };
      case 'stock':
        return { ...baseData, stock: -50 };
      case 'name':
        return { ...baseData, name: 'a' }; // Too short
      default:
        return baseData;
    }
  }
}