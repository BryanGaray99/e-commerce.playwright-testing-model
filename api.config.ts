export const API_CONFIG = {
  baseUrl: 'http://localhost:3000/v1/api',
  endpoints: {
    products: {
      base: '/products',
      byId: (id: string) => `/products/${id}`,
    },
    users: {
      base: '/users',
      byId: (id: string) => `/users/${id}`,
    },
    orders: {
      base: '/orders',
      byId: (id: string) => `/orders/${id}`,
    },
    categories: {
      base: '/categories',
      byId: (id: string) => `/categories/${id}`,
    },
    cart: {
      base: (userId: string) => `/cart/${userId}`,
      items: (userId: string) => `/cart/${userId}/items`,
      itemById: (userId: string, productId: string) => `/cart/${userId}/items/${productId}`,
    },
  },
  security: {
    bearer: {
      type: 'bearer',
      bearerFormat: 'JWT',
    },
    apiKey: {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-KEY',
    },
  },
} as const;

// Tipos para las respuestas de la API
export type ApiResponse<T> = {
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  status: number;
};

// Tipos para los DTOs principales
export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address: AddressDto;
}

export interface AddressDto {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateOrderDto {
  userId: string;
  items: OrderItemDto[];
  shippingAddress: AddressDto;
}

export interface OrderItemDto {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CreateCategoryDto {
  name: string;
  description: string;
  parentId?: string;
  isActive?: boolean;
}

export interface AddItemDto {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface UpdateItemDto {
  quantity: number;
} 