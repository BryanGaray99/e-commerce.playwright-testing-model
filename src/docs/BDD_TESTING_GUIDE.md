# 🧪 Guía de Testing BDD con Playwright y Cucumber

## 📋 Índice
1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Buenas Prácticas](#buenas-prácticas)
3. [Patrones de Código](#patrones-de-código)
4. [Depuración de Errores](#depuración-de-errores)
5. [Aprendizajes Clave](#aprendizajes-clave)
6. [Troubleshooting](#troubleshooting)
7. [Lecciones Aprendidas](#lecciones-aprendidas)

---

## 🏗️ Estructura del Proyecto

### Organización de Directorios
```
src/
├── api/                    # Clientes API
├── features/              # Archivos .feature (BDD)
├── steps/                 # Definiciones de steps
├── fixtures/              # Datos de prueba
├── schemas/               # Validaciones JSON Schema
├── types/                 # Tipos TypeScript
└── docs/                  # Documentación
```

### Convenciones de Nomenclatura
- **Features**: `[resource].feature` (ej: `products.feature`)
- **Steps**: `[resource].steps.ts` (ej: `product.steps.ts`)
- **Fixtures**: `[resource].fixture.ts` (ej: `product.fixture.ts`)
- **Schemas**: `[resource].schema.ts` (ej: `product.schema.ts`)

---

## ✅ Buenas Prácticas

### 1. **Estructura de Steps**
```typescript
// ✅ PATRÓN CORRECTO
Given('a product exists in the system', async function () {
  this.existingProduct = ProductFixture.createProductDto();
  const response = await productsClient.createProduct(this.existingProduct);
  expect(response.status).toBe(201);
  
  const productData = (response.data as any)?.data?.data || response.data;
  this.productId = productData.id;
  storeCreatedEntity('product', this.productId, response.data);
});

When('I update the product', async function () {
  this.updateData = ProductFixture.updateProductDto();
  
  try {
    const response = await productsClient.updateProduct(this.productId, this.updateData);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error updating product ${this.productId}:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});

Then('the product should be updated successfully', function () {
  const response = getLastResponse();
  const error = getLastError();

  if (error) {
    console.log(`❌ Update failed:`, error);
  }

  expect(response).toBeTruthy();
  expect(response.status).toBe(200);
  expect(response.data).toBeTruthy();

  const productData = (response.data as any)?.data?.data || response.data;
  Object.keys(this.updateData).forEach(key => {
    let expected = this.updateData[key];
    let actual = productData[key];
    if (["price", "stock"].includes(key)) {
      expected = Number(expected);
      actual = Number(actual);
    }
    expect(actual).toBe(expected);
  });

  expect(isValidProduct(productData)).toBe(true);
});
```

### 2. **Manejo de Respuestas API**
```typescript
// ✅ PATRÓN CORRECTO - Estructura anidada
const productData = (response.data as any)?.data?.data || response.data;

// ❌ PATRÓN INCORRECTO - Acceso directo
const productData = response.data;
```

### 3. **Logs Estratégicos**
```typescript
// ✅ SOLO LOGS ESENCIALES
// Logs de error con contexto
console.log(`❌ Error updating product ${this.productId}:`, error.status || 'Unknown error');

// Logs de fallo en validaciones
if (error) {
  console.log(`❌ Update failed:`, error);
}

// ❌ LOGS EXCESIVOS (evitar)
console.log('🔍 Response data:', JSON.stringify(response.data, null, 2));
console.log('🔍 Creating product:', JSON.stringify(productData, null, 2));
```

### 4. **Solo se pueden actualizar campos definidos en el DTO**
- Cuando se realiza un PATCH/PUT, **solo los campos definidos en el DTO correspondiente pueden ser actualizados**.
- Si intentas enviar un campo extra (no definido en el DTO), el ValidationPipe de NestJS lo rechazará (por ejemplo, con `forbidNonWhitelisted: true`).
- Para que un campo sea actualizable, debe estar explícitamente en el DTO de update (ej: `UpdateUserDto`, `UpdateProductDto`, etc.).
- Las interfaces (`User`, `Product`, etc.) solo definen la forma del objeto en memoria, pero **no controlan la validación de entrada**.
- Ejemplo: Si quieres permitir actualizar `isActive` en usuario, agrégalo al `UpdateUserDto`.

---

## 🔧 Patrones de Código

### 1. **Manejo de Errores Consistente**
```typescript
// Patrón estándar para When steps
When('I [action] the [resource]', async function () {
  try {
    const response = await [client].[method]([params]);
    handleApiResponse(response);
  } catch (error: any) {
    console.log(`❌ Error [action] [resource] ${this.[resource]Id}:`, error.status || 'Unknown error');
    handleApiResponse(null, error);
  }
});
```

### 2. **Validación de Respuestas**
```typescript
// Patrón estándar para Then steps
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

### 3. **Comparación de Tipos**
```typescript
// Para campos numéricos (price, stock, etc.)
Object.keys(this.updateData).forEach(key => {
  let expected = this.updateData[key];
  let actual = productData[key];
  if (["price", "stock"].includes(key)) {
    expected = Number(expected);
    actual = Number(actual);
  }
  expect(actual).toBe(expected);
});
```

---

## 🐛 Depuración de Errores

### 1. **Errores Comunes y Soluciones**

#### Error: `Expected: "99.99", Received: 99.99`
**Causa**: Comparación de string vs number
**Solución**: Convertir ambos a número antes de comparar
```typescript
if (["price", "stock"].includes(key)) {
  expected = Number(expected);
  actual = Number(actual);
}
```

#### Error: `expect(received).toBe(expected) // Object.is equality`
**Causa**: Acceso incorrecto a estructura anidada de respuesta
**Solución**: Usar patrón de acceso anidado
```typescript
const productData = (response.data as any)?.data?.data || response.data;
```

#### Error: `expect(received).toBeTruthy() // Received: null`
**Causa**: Respuestas 4xx/5xx no tratadas como errores
**Solución**: Modificar `handleApiResponse` para detectar status de error
```typescript
export function handleApiResponse(response: any, error?: any) {
  if (error) {
    testData.lastError = error;
    testData.lastResponse = null;
  } else if (response && response.status >= 400) {
    testData.lastError = {
      status: response.status,
      message: response.data?.message || 'HTTP Error',
      response: response
    };
    testData.lastResponse = null;
  } else {
    testData.lastResponse = response;
    testData.lastError = null;
  }
}
```

### 2. **Estrategia de Debugging**
1. **Identificar el step que falla**
2. **Agregar logs estratégicos temporalmente**
3. **Verificar estructura de respuesta API**
4. **Corregir acceso a datos**
5. **Limpiar logs innecesarios**

---

## 📚 Aprendizajes Clave

### 1. **Estructura de Respuesta API**
- Las APIs suelen devolver estructura anidada: `response.data.data.data`
- Siempre usar patrón de acceso seguro: `(response.data as any)?.data?.data || response.data`
- Validar estructura real vs esperada

### 2. **Manejo de Tipos**
- Los feature files pasan strings, pero las APIs devuelven números
- Convertir tipos antes de comparar: `Number(value)`
- Especial atención a campos numéricos: `price`, `stock`, `quantity`

### 3. **Logs Estratégicos**
- Solo logs de error y contexto esencial
- Formato consistente: `❌ Error [contexto]: [detalles]`
- Evitar logs de datos completos cuando todo funciona

### 4. **Validación de Schema**
- Usar JSON Schema para validar respuestas
- Validar tanto estructura como tipos de datos
- Proporcionar errores descriptivos en validaciones

### 5. **Solo se pueden actualizar campos definidos en el DTO**
- Cuando se realiza un PATCH/PUT, **solo los campos definidos en el DTO correspondiente pueden ser actualizados**.
- Si intentas enviar un campo extra (no definido en el DTO), el ValidationPipe de NestJS lo rechazará (por ejemplo, con `forbidNonWhitelisted: true`).
- Para que un campo sea actualizable, debe estar explícitamente en el DTO de update (ej: `UpdateUserDto`, `UpdateProductDto`, etc.).
- Las interfaces (`User`, `Product`, etc.) solo definen la forma del objeto en memoria, pero **no controlan la validación de entrada**.
- Ejemplo: Si quieres permitir actualizar `isActive` en usuario, agrégalo al `UpdateUserDto`.

---

## 🔧 Troubleshooting

### Problemas de Configuración
```bash
# Error: No tests found
# Solución: Verificar cucumber.cjs y rutas de features/steps

# Error: TypeScript compilation
# Solución: Verificar tsconfig.json y ts-node setup

# Error: API connection
# Solución: Verificar api.config.ts y puerto del backend
```

### Problemas de Ejecución
```bash
# Ejecutar test específico
npm run test:scenario "Scenario name"

# Ejecutar por tags
npm run test:single "@tag1 and @tag2"

# Debug mode
npm run test:debug
```

### Problemas de Datos
- **Fixtures**: Verificar generación de datos válidos
- **Schemas**: Verificar validaciones JSON Schema
- **Cleanup**: Verificar limpieza de datos entre tests

---

## 📚 Lecciones Aprendidas

### 🎯 **Lecciones Clave del Proyecto**

#### 1. **Validación de DTOs en Backend**
- **Problema**: Los DTOs del backend no tenían todas las validaciones necesarias
- **Solución**: Agregar `@ArrayMinSize(1)` para arrays que no pueden estar vacíos
- **Aprendizaje**: La validación debe ser consistente entre frontend y backend

#### 2. **Estructura de Respuesta API**
- **Problema**: Las APIs devuelven estructura anidada `response.data.data.data`
- **Solución**: Usar patrón `(response.data as any)?.data?.data || response.data`
- **Aprendizaje**: Siempre verificar la estructura real de respuesta vs esperada

#### 3. **Steps Duplicados en Cucumber**
- **Problema**: Definiciones duplicadas causan ambigüedad en Cucumber
- **Solución**: Centralizar steps comunes en `hooks.ts`
- **Aprendizaje**: Un solo lugar para definiciones de steps compartidos

#### 4. **Manejo de Campos en DTOs de Actualización**
- **Problema**: Campos no definidos en DTOs causan errores 422
- **Solución**: Solo enviar campos definidos en el DTO correspondiente
- **Aprendizaje**: Los DTOs controlan qué campos son actualizables

#### 5. **Logs Estratégicos**
- **Problema**: Logs excesivos dificultando la lectura de errores
- **Solución**: Solo logs de error con contexto esencial
- **Aprendizaje**: Logs solo cuando es necesario para debugging

#### 6. **Validación de Schemas**
- **Problema**: Datos no coinciden con schemas esperados
- **Solución**: Implementar validación JSON Schema en todos los steps
- **Aprendizaje**: Validar tanto estructura como tipos de datos

#### 7. **Fixtures y Datos de Prueba**
- **Problema**: Fixtures generan datos inválidos
- **Solución**: Asegurar tipos correctos (Number vs String)
- **Aprendizaje**: Los fixtures deben generar datos válidos para el backend

#### 8. **Manejo de Errores HTTP**
- **Problema**: Respuestas 4xx no se trataban como errores
- **Solución**: Modificar `handleApiResponse` para detectar status codes de error
- **Aprendizaje**: Tratar respuestas 4xx/5xx como errores, no como respuestas exitosas

#### 9. **Comparación de Tipos**
- **Problema**: Comparación de string vs number en validaciones
- **Solución**: Convertir ambos valores a Number() antes de comparar
- **Aprendizaje**: Los feature files pasan strings, las APIs devuelven números

#### 10. **Cleanup de Datos**
- **Problema**: Datos de prueba no se limpian correctamente
- **Solución**: Implementar cleanup robusto en hooks After
- **Aprendizaje**: Limpiar datos en orden inverso a las dependencias

### 🔧 **Patrones Implementados**

#### Patrón de Acceso a Datos
```typescript
// ✅ Patrón estándar
const data = (response.data as any)?.data?.data || response.data;
```

#### Patrón de Manejo de Errores
```typescript
// ✅ Patrón estándar
try {
  const response = await client.method(data);
  handleApiResponse(response);
} catch (error) {
  handleApiResponse(null, error);
}
```

#### Patrón de Validación
```typescript
// ✅ Patrón estándar
expect(isValidResource(data)).toBe(true);
if (!isValidResource(data)) {
  const errors = getResourceValidationErrors(data);
  throw new Error(`Invalid data: ${errors.join(', ')}`);
}
```

### 📊 **Métricas de Éxito**

#### Antes de las Correcciones
- ❌ Tests fallando por ambigüedad de steps
- ❌ Errores de validación no detectados
- ❌ Logs excesivos dificultando debugging
- ❌ Datos de prueba inconsistentes

#### Después de las Correcciones
- ✅ 17 scenarios (17 passed) - 100% éxito
- ✅ 115 steps (115 passed) - Sin errores
- ✅ Logs limpios y estratégicos
- ✅ Validaciones robustas implementadas
- ✅ Patrones de código consistentes

### 🎯 **Próximos Pasos Recomendados**

1. **Aplicar patrones a otros recursos** (cart, category, etc.)
2. **Implementar métricas de performance** de tests
3. **Agregar reportes personalizados** con contexto
4. **Integrar con CI/CD** pipelines
5. **Documentar nuevos aprendizajes** continuamente

---

*Última actualización: Junio 2025*
*Versión: 1.1* 