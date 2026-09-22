export type Category = {
  id: string;
  name: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
  commandId: string;
};

export type Product = {
  id: string;
  name: string;
  photo?: string;
  desc?: string;
  createdAt: string;
  updatedAt: string;
  oldPrice?: number;
  price: number;
  commandId: string;
  category: Category;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  signUpDate: string;
  commandId: string;
};

export const orderStatuses = [
  'pending_confirmation',
  'processing',
  'packaging',
  'waiting_for_delivery',
  'in_transit',
  'delivered',
  'return_requested',
  'order_cancelled',
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export type Order = {
  id: string;
  products: Array<{ _id: string; product: Product | null; quantity: number }>;
  user: Profile;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  commandId: string;
};

export type Pagination = { pageSize: number; pageNumber: number; total: number };
export type PagedResult<T> = { data: T[]; pagination: Pagination };
export type ServerError = { errors?: Array<{ fieldName?: string; message: string }> };
