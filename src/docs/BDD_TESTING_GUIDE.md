# 🧪 Guía de Testing BDD con Playwright y Cucumber

## 📋 Índice
1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Buenas Prácticas](#buenas-prácticas)
3. [Patrones de Código](#patrones-de-código)
4. [Depuración de Errores](#depuración-de-errores)
5. [Aprendizajes Clave](#aprendizajes-clave)
6. [Troubleshooting](#troubleshooting)

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

## 🚀 Próximos Pasos

### Mejoras Futuras
1. **Reportes personalizados** con información de contexto
2. **Screenshots automáticos** en fallos
3. **Métricas de performance** de tests
4. **Integración con CI/CD** pipelines
5. **Tests de carga** con Playwright

### Mantenimiento
- Revisar y actualizar guía regularmente
- Documentar nuevos patrones y aprendizajes
- Mantener consistencia en todos los archivos de steps
- Refactorizar código duplicado

---

*Última actualización: Junio 2025*
*Versión: 1.0* 