import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Product } from '../types/api';

type CartLine = { product: Product; quantity: number };
type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (product: Product) => void;
  changeQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};
const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = 'otus-shop-cart';

export function CartProvider({ children }: PropsWithChildren) {
  const [lines, setLines] = useState<CartLine[]>(
    () => JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') as CartLine[],
  );
  useEffect(() => localStorage.setItem(CART_KEY, JSON.stringify(lines)), [lines]);
  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      total: lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
      add: (product) =>
        setLines((current) => {
          const item = current.find((line) => line.product.id === product.id);
          return item
            ? current.map((line) =>
                line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line,
              )
            : [...current, { product, quantity: 1 }];
        }),
      changeQuantity: (id, quantity) =>
        setLines((current) =>
          quantity < 1
            ? current.filter((line) => line.product.id !== id)
            : current.map((line) => (line.product.id === id ? { ...line, quantity } : line)),
        ),
      remove: (id) => setLines((current) => current.filter((line) => line.product.id !== id)),
      clear: () => setLines([]),
    }),
    [lines],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart = () => {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
};
