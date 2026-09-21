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
    (
      await api.get<PagedResult<Product>>(
        `/products?${queryParams({ name: options.name, categoryIds: options.categoryIds, pagination: { pageNumber: options.pageNumber ?? 1, pageSize: options.pageSize ?? 10 }, sorting: options.sorting })}`,
      )
    ).data,
  create: async (body: {
    name: string;
    price: number;
    categoryId: string;
    desc?: string;
    photo?: string;
    oldPrice?: number;
  }) => (await api.post<Product>('/products', body)).data,
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
  ) => (await api.put<Product>(`/products/${id}`, body)).data,
  remove: (id: string) => api.delete(`/products/${id}`),
};

export const categoriesApi = {
  list: async () =>
    (
      await api.get<PagedResult<Category>>(
        `/categories?${queryParams({ pagination: { pageNumber: 1, pageSize: 100 } })}`,
      )
    ).data.data,
  create: async (body: { name: string }) => (await api.post<Category>('/categories', body)).data,
};

export const ordersApi = {
  list: async () =>
    (
      await api.get<PagedResult<Order>>(
        `/orders?${queryParams({ pagination: { pageNumber: 1, pageSize: 50 } })}`,
      )
    ).data.data,
  create: (products: Array<{ id: string; quantity: number }>) =>
    api.post<Order>('/orders', { products }),
  updateStatus: (id: string, status: OrderStatus) => api.patch<Order>(`/orders/${id}`, { status }),
};
