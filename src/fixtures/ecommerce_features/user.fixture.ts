import { faker } from '@faker-js/faker';
import { User, CreateUserDto, UpdateUserDto } from '../../types/ecommerce_types/user';
import { Address } from '../../types/common';

/**
 * User test data fixtures using Faker.js
 */
export class UserFixture {
  /**
   * Generate address data
   */
  static createAddress(overrides: Partial<Address> = {}): Address {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
      ...overrides
    };
  }

  /**
   * Generate a complete user object
   */
  static createUser(overrides: Partial<User> = {}): User {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number(),
      address: this.createAddress(),
      isActive: faker.datatype.boolean({ probability: 0.9 }),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    };
  }

  /**
   * Generate user creation data
   */
  static createUserDto(overrides: Partial<CreateUserDto> = {}): CreateUserDto {
    return {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number(),
      address: this.createAddress(),
      ...overrides
    };
  }

  /**
   * Generate user update data
   */
  static updateUserDto(overrides: Partial<UpdateUserDto> = {}): UpdateUserDto {
    const updates: UpdateUserDto = {};
    
    // Solo incluir campos básicos por defecto, no address
    if (faker.datatype.boolean()) updates.email = faker.internet.email();
    if (faker.datatype.boolean()) updates.firstName = faker.person.firstName();
    if (faker.datatype.boolean()) updates.lastName = faker.person.lastName();
    if (faker.datatype.boolean()) updates.phone = faker.phone.number();
    if (faker.datatype.boolean()) updates.isActive = faker.datatype.boolean();
    
    // Solo incluir address si se especifica explícitamente
    if (overrides.address) {
      updates.address = this.createAddress();
    }
    
    // Asegurar que al menos un campo esté presente si no hay overrides
    if (Object.keys(updates).length === 0 && Object.keys(overrides).length === 0) {
      updates.firstName = faker.person.firstName();
    }
    
    return { ...updates, ...overrides };
  }

  /**
   * Generate multiple users
   */
  static createUsers(count: number = 10, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.createUser(overrides));
  }

  /**
   * Generate user with specific email domain
   */
  static createUserWithDomain(domain: string, overrides: Partial<User> = {}): User {
    const email = `${faker.internet.userName()}@${domain}`;
    return this.createUser({ email, ...overrides });
  }

  /**
   * Generate inactive user
   */
  static createInactiveUser(overrides: Partial<User> = {}): User {
    return this.createUser({ isActive: false, ...overrides });
  }

  /**
   * Generate user with US address
   */
  static createUSUser(overrides: Partial<User> = {}): User {
    return this.createUser({
      address: this.createAddress({ country: 'United States' }),
      ...overrides
    });
  }

  /**
   * Generate user for specific testing scenarios
   */
  static createTestScenarios() {
    return {
      valid: this.createUser(),
      inactive: this.createInactiveUser(),
      withoutPhone: this.createUser({ phone: undefined }),
      usResident: this.createUSUser(),
      testUser: this.createUser({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      })
    };
  }

  /**
   * Generate invalid user data for negative testing
   */
  static createInvalidUser() {
    return {
      withoutEmail: this.createUserDto({ email: undefined as any }),
      withInvalidEmail: this.createUserDto({ email: 'invalid-email' }),
      withoutFirstName: this.createUserDto({ firstName: undefined as any }),
      withoutLastName: this.createUserDto({ lastName: undefined as any }),
      withoutAddress: (() => {
        const dto = this.createUserDto() as any;
        delete dto.address;
        return dto;
      })(),
      withEmptyFirstName: this.createUserDto({ firstName: '' }),
      withEmptyLastName: this.createUserDto({ lastName: '' })
    };
  }

  /**
   * Generate user with realistic data
   */
  static createRealisticUser(): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    
    return this.createUser({
      email,
      firstName,
      lastName,
      phone: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zipCode: faker.location.zipCode('#####'),
        country: 'United States'
      }
    });
  }
}