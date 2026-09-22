import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useState } from 'react';
import { getErrorMessage } from '../lib/api';
import { ordersApi } from '../services/shop';
import { orderStatuses, type Order, type OrderStatus } from '../types/api';

const labels: Record<OrderStatus, string> = {
  pending_confirmation: 'Новый',
  processing: 'В обработке',
  packaging: 'Сборка',
  waiting_for_delivery: 'Ожидает доставки',
  in_transit: 'В пути',
  delivered: 'Доставлен',
  return_requested: 'Возврат',
  order_cancelled: 'Отменён',
};
const money = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
export function OrdersPage({
  notify,
}: {
  notify: (severity: 'success' | 'error', detail: string) => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    ordersApi
      .list()
      .then(setOrders)
      .catch((error) => notify('error', getErrorMessage(error)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const total = (order: Order) =>
    order.products.reduce((sum, line) => sum + (line.product?.price ?? 0) * line.quantity, 0);
  const status = (order: Order) => (
    <Dropdown
      value={order.status}
      options={orderStatuses.map((value) => ({ label: labels[value], value }))}
      onChange={(event) =>
        ordersApi
          .updateStatus(order.id, event.value as OrderStatus)
          .then(() => {
            notify('success', 'Статус обновлён');
            load();
          })
          .catch((error) => notify('error', getErrorMessage(error)))
      }
    />
  );
  const products = (order: Order) => (
    <ul className="order-products">
      {order.products.map((line) => (
        <li key={line._id}>
          {line.product ? line.product.name : 'Товар недоступен'} x {line.quantity}
        </li>
      ))}
    </ul>
  );
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">История покупок</p>
          <h1>Мои заказы</h1>
        </div>
      </div>
      <DataTable value={orders} loading={loading} emptyMessage="Заказов пока нет." stripedRows>
        <Column field="id" header="Заказ" body={(order: Order) => `#${order.id.slice(-6)}`} />
        <Column
          field="createdAt"
          header="Дата"
          body={(order: Order) => new Date(order.createdAt).toLocaleDateString('ru-RU')}
        />
        <Column header="Товары" body={products} />
        <Column header="Сумма" body={(order: Order) => money(total(order))} />
        <Column header="Статус" body={status} />
      </DataTable>
    </section>
  );
}
