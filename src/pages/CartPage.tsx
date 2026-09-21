import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getErrorMessage } from '../lib/api';
import { ordersApi } from '../services/shop';

const money = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
export function CartPage({
  notify,
}: {
  notify: (severity: 'success' | 'error', detail: string) => void;
}) {
  const { lines, total, changeQuantity, remove, clear } = useCart();
  const { profile } = useAuth();
  const [ordering, setOrdering] = useState(false);
  const navigate = useNavigate();
  const order = async () => {
    if (!profile) {
      navigate('/login');
      return;
    }
    setOrdering(true);
    try {
      await ordersApi.create(lines.map(({ product, quantity }) => ({ id: product.id, quantity })));
      clear();
      notify('success', 'Заказ оформлен');
      navigate('/orders');
    } catch (error) {
      notify('error', getErrorMessage(error));
    } finally {
      setOrdering(false);
    }
  };
  if (!lines.length)
    return (
      <section className="page empty-page">
        <i className="pi pi-shopping-cart" />
        <h1>Корзина пуста</h1>
        <p>Добавьте товары из каталога, чтобы оформить заказ.</p>
        <Button label="Перейти в каталог" icon="pi pi-arrow-left" onClick={() => navigate('/')} />
      </section>
    );
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Оформление</p>
          <h1>Корзина</h1>
        </div>
      </div>
      <div className="cart-layout">
        <div className="cart-lines">
          {lines.map(({ product, quantity }) => (
            <article className="cart-line" key={product.id}>
              {product.photo ? (
                <img src={product.photo} alt="" />
              ) : (
                <div className="cart-image">
                  <i className="pi pi-image" />
                </div>
              )}
              <div>
                <h2>{product.name}</h2>
                <p>{product.category.name}</p>
                <strong>{money(product.price)}</strong>
              </div>
              <InputNumber
                value={quantity}
                onValueChange={(event) => changeQuantity(product.id, event.value ?? 1)}
                showButtons
                buttonLayout="horizontal"
                decrementButtonIcon="pi pi-minus"
                incrementButtonIcon="pi pi-plus"
                min={1}
              />
              <strong>{money(product.price * quantity)}</strong>
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                aria-label="Удалить"
                onClick={() => remove(product.id)}
              />
            </article>
          ))}
        </div>
        <aside className="order-summary">
          <p>Ваш заказ</p>
          <h2>Итого: {money(total)}</h2>
          <Button label="Оформить заказ" icon="pi pi-check" onClick={order} loading={ordering} />
          <Button label="Очистить корзину" text severity="secondary" onClick={clear} />
        </aside>
      </div>
    </section>
  );
}
