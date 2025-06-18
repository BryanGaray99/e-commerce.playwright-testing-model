# 🚨 Patrones de Errores y Soluciones

## 📋 Errores Comunes en Testing BDD

### 1. **Errores de Comparación de Tipos**

#### Problema: String vs Number
```typescript
// ❌ Error
Expected: "99.99"
Received: 99.99
```

**Causa**: Los feature files pasan valores como strings, pero las APIs devuelven números.

**Solución**:
```typescript
// ✅ Solución
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

#### Problema: Undefined vs Null
```typescript
// ❌ Error
Expected: true
Received: false
```

**Causa**: Acceso incorrecto a propiedades anidadas.

**Solución**:
```typescript
// ✅ Solución
const productData = (response.data as any)?.data?.data || response.data;
```

### 2. **Errores de Estructura de Respuesta**

#### Problema: Acceso Directo a Datos
```typescript
// ❌ Error
expect(response.data.id).toBe(this.productId);
```

**Causa**: La API devuelve estructura anidada.

**Solución**:
```typescript
// ✅ Solución
const productData = (response.data as any)?.data?.data || response.data;
expect(productData.id).toBe(this.productId);
```

#### Problema: Arrays No Encontrados
```typescript
// ❌ Error
expect(Array.isArray(response.data)).toBe(true);
```

**Causa**: Los arrays están anidados en la respuesta.

**Solución**:
```typescript
// ✅ Solución
const productsData = (response.data as any)?.data?.data || response.data;
expect(Array.isArray(productsData)).toBe(true);
```

### 3. **Errores de Manejo de Errores**

#### Problema: Errores 4xx No Detectados
```typescript
// ❌ Error
expect(error).toBeTruthy();
Received: null
```

**Causa**: Las respuestas 4xx no se tratan como errores.

**Solución**:
```typescript
// ✅ Solución en handleApiResponse
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

### 4. **Errores de Validación de Schema**

#### Problema: Validación Fallida
```typescript
// ❌ Error
expect(isValidProduct(productData)).toBe(true);
```

**Causa**: Datos no coinciden con el schema esperado.

**Solución**:
```typescript
// ✅ Solución con logging
const isValid = isValidProduct(productData);
if (!isValid) {
  const errors = getProductValidationErrors(productData);
  console.log('❌ Schema validation failed:', errors);
}
expect(isValid).toBe(true);
```

### 5. **Errores de Configuración**

#### Problema: Tests No Encontrados
```bash
# ❌ Error
No scenarios found
```

**Causa**: Configuración incorrecta de Cucumber.

**Solución**:
```javascript
// ✅ cucumber.cjs
const common = [
  'src/features/ecommerce_features/**/*.feature',
  '--require-module ts-node/register',
  '--require src/steps/**/*.ts',
  '--format @cucumber/pretty-formatter'
].join(' ');
```

#### Problema: TypeScript Compilation
```bash
# ❌ Error
Cannot find module 'ts-node/register'
```

**Causa**: Dependencias no instaladas.

**Solución**:
```bash
npm install --save-dev ts-node typescript @types/node
```

### 6. **Errores de Conectividad**

#### Problema: API No Disponible
```typescript
// ❌ Error
connect ECONNREFUSED 127.0.0.1:3000
```

**Causa**: Backend no está ejecutándose o puerto incorrecto.

**Solución**:
```typescript
// ✅ Verificar configuración
export const API_CONFIG = {
  baseUrl: 'http://localhost:3004/v1/api', // Puerto correcto
  // ...
};
```

### 7. **Errores de Datos de Prueba**

#### Problema: Datos Inválidos
```typescript
// ❌ Error
422 Unprocessable Entity
```

**Causa**: Fixtures generan datos que no pasan validación del backend.

**Solución**:
```typescript
// ✅ Fixture corregido
export class ProductFixture {
  static createProductDto(): CreateProductDto {
    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()), // Asegurar que sea número
      categoryId: faker.string.uuid(),
      stock: faker.number.int({ min: 0, max: 1000 }), // Asegurar que sea número
      imageUrl: faker.image.url(),
      isActive: true
    };
  }
}
```

### 8. **Error: PATCH/PUT con campos no definidos en el DTO**

#### Problema: El backend rechaza el campo con 422 o error de validación
```typescript
// ❌ Error
PATCH /users/:id { isActive: false }
// Respuesta: 422 Unprocessable Entity
```
**Causa**: El campo `isActive` no está definido en el DTO de actualización (`UpdateUserDto`).

**Solución**:
- Solo enviar campos que estén definidos en el DTO.
- Si se requiere actualizar ese campo, agregarlo explícitamente al DTO de update.
```typescript
// ✅ Solución
export class UpdateUserDto {
  // ...otros campos...
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

## 🔍 Estrategia de Debugging

### 1. **Identificar el Problema**
```typescript
// Agregar logs temporales
console.log('🔍 Response:', response);
console.log('🔍 Error:', error);
console.log('🔍 Expected:', expected);
console.log('🔍 Actual:', actual);
```

### 2. **Verificar Estructura**
```typescript
// Verificar estructura real vs esperada
console.log('🔍 Response structure:', JSON.stringify(response, null, 2));
```

### 3. **Validar Tipos**
```typescript
// Verificar tipos de datos
console.log('🔍 Expected type:', typeof expected);
console.log('🔍 Actual type:', typeof actual);
```

### 4. **Limpiar Logs**
```typescript
// Mantener solo logs de error
if (error) {
  console.log(`❌ Error [contexto]:`, error);
}
```

## 📝 Checklist de Depuración

- [ ] Verificar configuración de Cucumber
- [ ] Verificar puerto y disponibilidad del backend
- [ ] Verificar estructura de respuesta API
- [ ] Verificar tipos de datos (string vs number)
- [ ] Verificar manejo de errores HTTP
- [ ] Verificar validación de schemas
- [ ] Verificar fixtures y datos de prueba
- [ ] Limpiar logs innecesarios

## 🎯 Patrones de Solución

### Para Errores de Tipo:
1. Identificar campos numéricos
2. Convertir ambos valores a Number()
3. Comparar valores convertidos

### Para Errores de Estructura:
1. Verificar respuesta real de la API
2. Usar patrón de acceso anidado
3. Implementar fallback con || operator

### Para Errores de Manejo:
1. Modificar handleApiResponse
2. Detectar status codes 4xx/5xx
3. Tratar como errores en lugar de respuestas

---

*Documento actualizado: Junio 2025* 