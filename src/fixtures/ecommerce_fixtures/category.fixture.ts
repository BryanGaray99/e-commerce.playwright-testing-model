import { faker } from '@faker-js/faker';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../types/ecommerce_types/category';

/**
 * Category test data fixtures using Faker.js
 */
export class CategoryFixture {
  /**
   * Generate a complete category object
   */
  static createCategory(overrides: Partial<Category> = {}): Category {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.department(),
      description: faker.lorem.sentence(),
      parentId: faker.datatype.boolean({ probability: 0.3 }) ? faker.string.uuid() : undefined,
      isActive: faker.datatype.boolean({ probability: 0.9 }),
      children: undefined, // Will be populated if needed
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    };
  }

  /**
   * Generate category creation data
   */
  static createCategoryDto(overrides: Partial<CreateCategoryDto> = {}): CreateCategoryDto {
    return {
      name: faker.commerce.department(),
      description: faker.lorem.sentence(),
      parentId: faker.datatype.boolean({ probability: 0.3 }) ? faker.string.uuid() : undefined,
      isActive: true,
      ...overrides
    };
  }

  /**
   * Generate category update data
   */
  static updateCategoryDto(overrides: Partial<UpdateCategoryDto> = {}): UpdateCategoryDto {
    const updates: UpdateCategoryDto = {};
    
    // Randomly include some fields
    if (faker.datatype.boolean()) updates.name = faker.commerce.department();
    if (faker.datatype.boolean()) updates.description = faker.lorem.sentence();
    if (faker.datatype.boolean()) updates.parentId = faker.string.uuid();
    if (faker.datatype.boolean()) updates.isActive = faker.datatype.boolean();

    return { ...updates, ...overrides };
  }

  /**
   * Generate multiple categories
   */
  static createCategories(count: number = 10, overrides: Partial<Category> = {}): Category[] {
    return Array.from({ length: count }, () => this.createCategory(overrides));
  }

  /**
   * Generate root category (no parent)
   */
  static createRootCategory(overrides: Partial<CreateCategoryDto> = {}): CreateCategoryDto {
    return this.createCategoryDto({ parentId: undefined, ...overrides });
  }

  /**
   * Generate child category
   */
  static createChildCategory(parentId: string, overrides: Partial<CreateCategoryDto> = {}): CreateCategoryDto {
    return this.createCategoryDto({ parentId, ...overrides });
  }

  /**
   * Generate inactive category
   */
  static createInactiveCategory(overrides: Partial<Category> = {}): Category {
    return this.createCategory({ isActive: false, ...overrides });
  }

  /**
   * Generate category with children
   */
  static createCategoryWithChildren(childCount: number = 3, overrides: Partial<Category> = {}): Category {
    const parent = this.createCategory(overrides);
    const children = Array.from({ length: childCount }, () => 
      this.createCategory({ parentId: parent.id })
    );
    
    return { ...parent, children };
  }

  /**
   * Generate category hierarchy
   */
  static createCategoryHierarchy() {
    const electronicsId = faker.string.uuid();
    const clothingId = faker.string.uuid();

    const electronics = this.createCategoryDto({
      name: 'Electronics',
      description: 'Electronic devices and accessories'
    });

    const smartphones = this.createChildCategory(electronicsId, {
      name: 'Smartphones',
      description: 'Mobile phones and accessories'
    });

    const laptops = this.createChildCategory(electronicsId, {
      name: 'Laptops',
      description: 'Portable computers and accessories'
    });

    const clothing = this.createCategoryDto({
      name: 'Clothing',
      description: 'Apparel and fashion items'
    });

    const mensClothing = this.createChildCategory(clothingId, {
      name: "Men's Clothing",
      description: 'Clothing items for men'
    });

    const womensClothing = this.createChildCategory(clothingId, {
      name: "Women's Clothing",
      description: 'Clothing items for women'
    });

    return {
      electronics: { ...electronics, children: [smartphones, laptops] },
      clothing: { ...clothing, children: [mensClothing, womensClothing] },
      smartphones,
      laptops,
      mensClothing,
      womensClothing
    };
  }

  /**
   * Generate category for specific testing scenarios
   */
  static createTestScenarios() {
    return {
      valid: this.createCategory(),
      root: this.createRootCategory(),
      child: this.createChildCategory(faker.string.uuid()),
      inactive: this.createInactiveCategory(),
      withChildren: this.createCategoryWithChildren(),
      electronics: this.createCategory({
        name: 'Electronics',
        description: 'Electronic devices and accessories'
      }),
      clothing: this.createCategory({
        name: 'Clothing',
        description: 'Apparel and fashion items'
      })
    };
  }

  /**
   * Generate invalid category data for negative testing
   */
  static createInvalidCategory() {
    return {
      withoutName: this.createCategoryDto({ name: undefined as any }),
      withoutDescription: this.createCategoryDto({ description: undefined as any }),
      withEmptyName: this.createCategoryDto({ name: '' }),
      withShortName: this.createCategoryDto({ name: 'A' }),
      withEmptyDescription: this.createCategoryDto({ description: '' })
    };
  }

  /**
   * Generate predefined categories for consistent testing
   */
  static createPredefinedCategories() {
    return [
      this.createCategory({
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        parentId: undefined
      }),
      this.createCategory({
        name: 'Books',
        description: 'Books and literature',
        parentId: undefined
      }),
      this.createCategory({
        name: 'Clothing',
        description: 'Apparel and fashion items',
        parentId: undefined
      }),
      this.createCategory({
        name: 'Home & Garden',
        description: 'Home improvement and garden supplies',
        parentId: undefined
      }),
      this.createCategory({
        name: 'Sports & Outdoors',
        description: 'Sports equipment and outdoor gear',
        parentId: undefined
      })
    ];
  }
}