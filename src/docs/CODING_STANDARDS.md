# 📋 Estándares de Código - Testing BDD

## 🎯 Principios Fundamentales

### 1. **Previsibilidad**
- Código debe ser predecible y seguir patrones consistentes
- Misma estructura para todos los archivos de steps
- Mismo manejo de errores en todos los recursos

### 2. **Mantenibilidad**
- Código limpio y fácil de entender
- Logs estratégicos (solo cuando es necesario)
- Documentación clara y actualizada

### 3. **Robustez**
- Manejo robusto de errores
- Validaciones de schema en todos los steps
- Fallbacks para casos edge

### 4. **Actualización de campos vía PATCH/PUT y DTOs**
- Solo se pueden actualizar campos que estén definidos en el DTO de actualización correspondiente.
- Si un campo solo existe en la interfaz y no en el DTO, no será aceptado por el backend.
- Para que un campo sea actualizable, debe agregarse explícitamente al DTO de update.
- Ejemplo: Si quieres actualizar `isActive` en usuario, debe estar en `UpdateUserDto`.

---

## 📝 Estructura de Archivos

### Nomenclatura
```
src/steps/ecommerce_steps/
├── product.steps.ts      # ✅ Correcto
├── user.steps.ts         # ✅ Correcto
├── order.steps.ts        # ✅ Correcto
├── category.steps.ts     # ✅ Correcto
└── cart.steps.ts         # ✅ Correcto
```

### Imports Estándar
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { [resource]Client, handleApiResponse, getLastResponse, getLastError, storeCreatedEntity } from '../hooks';
import { [Resource]Fixture } from '../../fixtures/ecommerce_features/[resource].fixture';
import { isValid[Resource], isValid[Resource]List, get[Resource]ValidationErrors } from '../../schemas/ecommerce_schemas/[resource].schema';
```

---

## 🔧 Patrones de Código

### 1. **Given Steps - Creación de Datos**
```typescript
Given('a [resource] exists in the system', async function () {
  this.existing[Resource] = [Resource]Fixture.create[Resource]Dto();
  const response = await [resource]Client.create[Resource](this.existing[Resource]);
  expect(response.status).toBe(201);
  
  const [resource]Data = (response.data as any)?.data?.data || response.data;
  this.[resource]Id = [resource]Data.id;
  storeCreatedEntity('[resource]', this.[resource]Id, response.data);
});
```

### 2. **When Steps - Acciones**
```typescript
When('I [action] the [resource]', async function () {
  try {
    const response = await [resource]Client.[action][Resource]([params]);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error [action] [resource] ${this.[resource]Id}:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});
```

### 3. **Then Steps - Validaciones**
```typescript
Then('the [resource] should be [action] successfully', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ [Action] failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe([expectedStatus]);
  expect(response.data).toBeTruthy();

  const [resource]Data = (response.data as any)?.data?.data || response.data;
  // Validaciones específicas...
  expect(isValid[Resource]([resource]Data)).toBe(true);
});
```

---

## 🚨 Manejo de Errores

### Patrón Estándar de Logs
```typescript
// ✅ Logs de error con contexto
console.log(`❌ Error [action] [resource] ${this.[resource]Id}:`, error.status || 'Unknown error');

// ✅ Logs de fallo en validaciones
if (error) {
  console.log(`❌ [Action] failed:`, error);
}

// ❌ Logs excesivos (evitar)
console.log('🔍 Response data:', JSON.stringify(response.data, null, 2));
console.log('🔍 Creating [resource]:', JSON.stringify([resource]Data, null, 2));
```

### Estructura de Respuesta
```typescript
// ✅ Patrón estándar para acceso a datos
const [resource]Data = (response.data as any)?.data?.data || response.data;

// ✅ Para arrays
const [resource]sData = (response.data as any)?.data?.data || response.data;
expect(Array.isArray([resource]sData)).toBe(true);
```

---

## 🔍 Validaciones

### Schema Validation
```typescript
// ✅ Validación con logging de errores
const isValid = isValid[Resource]([resource]Data);
if (!isValid) {
  const errors = get[Resource]ValidationErrors([resource]Data);
  console.log('❌ Schema validation failed:', errors);
}
expect(isValid).toBe(true);
```

### Comparación de Tipos
```typescript
// ✅ Para campos numéricos
Object.keys(this.updateData).forEach(key => {
  let expected = this.updateData[key];
  let actual = [resource]Data[key];
  if (["price", "stock", "quantity"].includes(key)) {
    expected = Number(expected);
    actual = Number(actual);
  }
  expect(actual).toBe(expected);
});
```

---

## 📊 Estructura de Datos

### Fixtures
```typescript
export class [Resource]Fixture {
  static create[Resource]Dto(): Create[Resource]Dto {
    return {
      // Campos con tipos correctos
      price: Number(faker.commerce.price()),
      stock: faker.number.int({ min: 0, max: 1000 }),
      // ...
    };
  }
}
```

### Schemas
```typescript
export const [resource]Schema: JSONSchemaType<[Resource]> = {
  type: 'object',
  properties: {
    // Propiedades con validaciones
  },
  required: ['id', 'name', /* ... */],
  additionalProperties: false
};
```

---

## 🧪 Testing Patterns

### Test Individual
```bash
# ✅ Ejecutar test específico
npm run test:scenario "Scenario name"

# ✅ Ejecutar por tags
npm run test:single "@tag1 and @tag2"
```

### Background Setup
```typescript
// ✅ En hooks.ts
Before(async function() {
  testData.lastResponse = null;
  testData.lastError = null;
});

After(async function() {
  // Cleanup de datos creados
});
```

---

## 📋 Checklist de Calidad

### Antes de Commit
- [ ] Código sigue patrones establecidos
- [ ] Logs solo de errores y contexto esencial
- [ ] Validaciones de schema implementadas
- [ ] Manejo robusto de errores
- [ ] Estructura de respuesta correcta
- [ ] Tipos de datos manejados correctamente
- [ ] Tests pasan sin errores
- [ ] Documentación actualizada

### Revisión de Código
- [ ] Consistencia en nomenclatura
- [ ] Patrones de código seguidos
- [ ] Logs apropiados (no excesivos)
- [ ] Manejo de errores robusto
- [ ] Validaciones implementadas
- [ ] Código legible y mantenible

---

## 🔄 Flujo de Desarrollo

### 1. **Crear Feature**
```gherkin
@[resource] @smoke
Feature: [Resource] API
  Scenario: [Action] [resource]
    Given [setup]
    When I [action] the [resource]
    Then the [resource] should be [action] successfully
```

### 2. **Implementar Steps**
```typescript
// Seguir patrones establecidos
Given('[setup]', async function () { /* ... */ });
When('I [action] the [resource]', async function () { /* ... */ });
Then('the [resource] should be [action] successfully', function () { /* ... */ });
```

### 3. **Validar y Limpiar**
- Ejecutar tests
- Verificar logs (solo errores)
- Limpiar código innecesario
- Documentar aprendizajes

---

## 📚 Recursos

### Archivos de Referencia
- `BDD_TESTING_GUIDE.md` - Guía completa
- `ERROR_PATTERNS.md` - Patrones de errores
- `product.steps.ts` - Ejemplo de implementación

### Comandos Útiles
```bash
# Ejecutar todos los tests
npm run test:bdd

# Ejecutar tests específicos
npm run test:[resource]

# Debug mode
npm run test:debug
```

---

*Estándares actualizados: Junio 2025*
*Versión: 1.0* 