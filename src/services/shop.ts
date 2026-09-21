import { api } from '../lib/api';
import { queryParams } from '../lib/query';
import type { Category, Order, OrderStatus, PagedResult, Product } from '../types/api';

type ListOptions = {
  pageNumber?: number;
  pageSize?: number;
  name?: string;
  categoryIds?: string[];
  sorting?: { field: string; type: 'ASC' | 'DESC' };
};

export const productsApi = {
  list: async (options: ListOptions = {}) =>
    api.get<PagedResult<Product>>(
      `/products?${queryParams({ name: options.name, categoryIds: options.categoryIds, pagination: { pageNumber: options.pageNumber ?? 1, pageSize: options.pageSize ?? 10 }, sorting: options.sorting })}`,
    ),
  create: async (body: {
    name: string;
    price: number;
    categoryId: string;
    desc?: string;
    photo?: string;
    oldPrice?: number;
  }) => api.post<Product>('/products', body),
  update: async (
    id: string,
    body: {
      name: string;
      price: number;
      categoryId: string;
      desc?: string;
      photo?: string;
      oldPrice?: number;
    },
  ) => api.put<Product>(`/products/${id}`, body),
  remove: (id: string) => api.delete(`/products/${id}`),
};

export const categoriesApi = {
  list: async () =>
    (
      await api.get<PagedResult<Category>>(
        `/categories?${queryParams({ pagination: { pageNumber: 1, pageSize: 100 } })}`,
      )
    ).data,
  create: (body: { name: string }) => api.post<Category>('/categories', body),
};

export const ordersApi = {
  list: async () =>
    (
      await api.get<PagedResult<Order>>(
        `/orders?${queryParams({ pagination: { pageNumber: 1, pageSize: 50 } })}`,
      )
    ).data,
  create: (products: Array<{ id: string; quantity: number }>) =>
    api.post<Order>('/orders', { products }),
  updateStatus: (id: string, status: OrderStatus) => api.patch<Order>(`/orders/${id}`, { status }),
};
