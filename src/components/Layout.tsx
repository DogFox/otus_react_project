import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const { count } = useCart();
  const [search, setSearch] = useState('');
  const [dark, setDark] = useState(() => localStorage.getItem('otus-shop-theme') === 'dark');
  const navigate = useNavigate();
  useEffect(() => {
    document.documentElement.classList.toggle('app-dark', dark);
    localStorage.setItem('otus-shop-theme', dark ? 'dark' : 'light');
  }, [dark]);
  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(search.trim() ? `/?search=${encodeURIComponent(search.trim())}` : '/');
  };
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <i className="pi pi-shopping-bag" /> OTUS Market
        </Link>
        <form className="search" onSubmit={submitSearch}>
          <InputText
            aria-label="Поиск товаров"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск товаров"
          />
          <Button aria-label="Искать" icon="pi pi-search" type="submit" text />
        </form>
        <nav>
          <NavLink to="/">Каталог</NavLink>
          {profile && <NavLink to="/orders">Заказы</NavLink>}
          <Button
            aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
            icon={dark ? 'pi pi-sun' : 'pi pi-moon'}
            text
            rounded
            onClick={() => setDark((value) => !value)}
          />
          <NavLink className="cart-link" to="/cart">
            <i className="pi pi-shopping-cart" />
            <span>{count}</span>
          </NavLink>
          {profile ? (
            <>
              <NavLink to="/profile" aria-label="Профиль">
                <i className="pi pi-user" />
              </NavLink>
              <Button
                aria-label="Выйти"
                icon="pi pi-sign-out"
                text
                rounded
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
              />
            </>
          ) : (
            <NavLink to="/login">Войти</NavLink>
          )}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
