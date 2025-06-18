# E-commerce API Testing Framework

A comprehensive API testing framework built with Playwright, TypeScript, and Cucumber BDD for testing the E-commerce API.

## 🚀 Features

- **Playwright Integration**: Fast and reliable API testing with Playwright's APIRequestContext
- **BDD with Cucumber**: Natural language test scenarios using Gherkin syntax
- **TypeScript Support**: Full type safety and IntelliSense support
- **Schema Validation**: Contract testing with AJV schema validation
- **Test Data Management**: Realistic test data generation with Faker.js
- **Modular Architecture**: Clean separation of concerns with POO design
- **Comprehensive Reporting**: HTML, JSON, and Cucumber reports
- **Environment Configuration**: Multi-environment support with dotenv

## 📁 Project Structure

```
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── playwright.config.ts      # Playwright configuration
├── cucumber.cjs             # Cucumber configuration
├── .env.template            # Environment variables template
├── .gitignore              # Git ignore rules
└── src/
    ├── api/                # API clients and base classes
    │   ├── BaseApiClient.ts
    │   ├── ProductsClient.ts
    │   ├── UsersClient.ts
    │   ├── OrdersClient.ts
    │   ├── CategoriesClient.ts
    │   ├── CartClient.ts
    │   ├── global-setup.ts
    │   └── global-teardown.ts
    ├── schemas/            # AJV validation schemas
    │   ├── product.schema.ts
    │   ├── user.schema.ts
    │   ├── order.schema.ts
    │   ├── category.schema.ts
    │   └── cart.schema.ts
    ├── fixtures/           # Test data factories
    │   ├── product.fixture.ts
    │   ├── user.fixture.ts
    │   ├── order.fixture.ts
    │   ├── category.fixture.ts
    │   └── cart.fixture.ts
    ├── types/              # TypeScript interfaces
    │   ├── product.ts
    │   ├── user.ts
    │   ├── order.ts
    │   ├── category.ts
    │   ├── cart.ts
    │   └── common.ts
    ├── steps/              # Cucumber step definitions
    │   ├── hooks.ts
    │   ├── product.steps.ts
    │   ├── user.steps.ts
    │   ├── order.steps.ts
    │   ├── category.steps.ts
    │   └── cart.steps.ts
    ├── features/           # BDD feature files
    │   ├── products.feature
    │   ├── users.feature
    │   ├── orders.feature
    │   ├── categories.feature
    │   └── cart.feature
    └── tests/              # Playwright test specs
        ├── products.spec.ts
        ├── users.spec.ts
        ├── orders.spec.ts
        ├── categories.spec.ts
        └── cart.spec.ts
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone or create the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npm run install-browsers
   ```

4. Configure environment:
   ```bash
   cp .env.template .env
   # Edit .env with your API configuration
   ```

## 🧪 Running Tests

### Playwright Tests
```bash
# Run all API tests
npm test

# Run with UI mode
npm run test:ui

# Run in headed mode
npm run test:headed

# Debug tests
npm run test:debug

# View test report
npm run report
```

### Cucumber BDD Tests
```bash
# Run all BDD scenarios
npm run test:bdd

# Run specific tags
npm run test:bdd -- --tags "@smoke"
npm run test:bdd -- --tags "@products"
npm run test:bdd -- --tags "@regression"
```

### Available Tags
- `@smoke` - Critical functionality tests
- `@regression` - Full regression suite
- `@products` - Product-related scenarios
- `@users` - User management scenarios
- `@orders` - Order processing scenarios
- `@categories` - Category management scenarios
- `@cart` - Shopping cart scenarios

## 🔧 Configuration

### Environment Variables

Copy `.env.template` to `.env` and configure:

- `API_URL`: Base URL of the API (default: http://localhost:3000)
- `API_KEY`: API key for authentication (if required)
- `JWT_TOKEN`: JWT token for authentication (if required)

### Test Configuration

Modify `playwright.config.ts` for:
- Retry strategies
- Parallel execution
- Reporting options
- Timeout settings

## 📊 Reporting

The framework generates multiple report formats:

- **HTML Report**: `playwright-report/index.html`
- **JSON Report**: `test-results/results.json`
- **Cucumber Report**: `test-results/cucumber-report.html`

## 🏗️ Architecture

### API Clients
Each resource has a dedicated client class extending `BaseApiClient`:
- Type-safe method signatures
- Built-in error handling
- Request/response logging
- Schema validation

### Schema Validation
AJV schemas validate API responses against OpenAPI specifications:
- Contract testing
- Data integrity validation
- Regression detection

### Test Data Management
Faker.js fixtures provide:
- Realistic test data
- Consistent data generation
- Easy customization

## 🤝 Contributing

1. Follow the existing code structure
2. Add comprehensive tests for new features
3. Update documentation as needed
4. Ensure all tests pass before committing

## 📝 License

MIT License - see LICENSE file for details.