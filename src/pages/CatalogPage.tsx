import { Button } from 'primereact/button';
import { DataTable, type DataTablePageEvent, type DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Skeleton } from 'primereact/skeleton';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CategoryDialog } from '../components/CategoryDialog';
import { ProductDialog } from '../components/ProductDialog';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getErrorMessage } from '../lib/api';
import { categoriesApi, productsApi } from '../services/shop';
import type { Category, Product } from '../types/api';

const money = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
export function CatalogPage({
  notify,
}: {
  notify: (severity: 'success' | 'error', detail: string) => void;
}) {
  const { profile } = useAuth();
  const { add } = useCart();
  const [params] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [sort, setSort] = useState<{ field: string; order: 1 | -1 }>({
    field: 'createdAt',
    order: -1,
  });
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const loadCategories = () =>
    categoriesApi
      .list()
      .then(setCategories)
      .catch(() => undefined);
  const load = () => {
    setLoading(true);
    productsApi
      .list({
        pageNumber: page + 1,
        pageSize: 10,
        name: params.get('search') ?? undefined,
        categoryIds: categoryId ? [categoryId] : undefined,
        sorting: { field: sort.field, type: sort.order === 1 ? 'ASC' : 'DESC' },
      })
      .then((result) => {
        setProducts(result.data);
        setTotal(result.pagination.total);
      })
      .catch((error) => notify('error', getErrorMessage(error)))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    void loadCategories();
  }, []);
  useEffect(() => {
    load();
  }, [page, categoryId, sort, params]);
  const image = (product: Product) =>
    product.photo ? (
      <img className="product-thumb" src={product.photo} alt="" />
    ) : (
      <div className="product-thumb placeholder">
        <i className="pi pi-image" />
      </div>
    );
  const actions = (product: Product) => (
    <div className="row-actions">
      <Button
        icon="pi pi-cart-plus"
        rounded
        text
        aria-label="Добавить в корзину"
        onClick={() => {
          add(product);
          notify('success', 'Товар добавлен в корзину');
        }}
      />
      {profile && (
        <>
          <Button
            icon="pi pi-pencil"
            rounded
            text
            aria-label="Редактировать"
            onClick={() => setEditing(product)}
          />
          <Button
            icon="pi pi-trash"
            rounded
            text
            severity="danger"
            aria-label="Удалить"
            onClick={() => {
              if (window.confirm(`Удалить «${product.name}»?`))
                productsApi
                  .remove(product.id)
                  .then(() => {
                    notify('success', 'Товар удалён');
                    load();
                  })
                  .catch((error) => notify('error', getErrorMessage(error)));
            }}
          />
        </>
      )}
    </div>
  );
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Витрина</p>
          <h1>Каталог товаров</h1>
        </div>
        {profile && (
          <div className="header-actions">
            <Button
              label="Категория"
              icon="pi pi-tags"
              outlined
              onClick={() => setCategoryDialog(true)}
            />
            <Button label="Добавить товар" icon="pi pi-plus" onClick={() => setEditing(null)} />
          </div>
        )}
      </div>
      <div className="catalog-filters">
        <span className="input-with-icon">
          <i className="pi pi-search" />
          <InputText
            value={params.get('search') ?? ''}
            placeholder="Поиск в верхней панели"
            readOnly
          />
        </span>
        <Dropdown
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.value);
            setPage(0);
          }}
          options={categories}
          optionLabel="name"
          optionValue="id"
          showClear
          placeholder="Все категории"
        />
      </div>
      {loading ? (
        <div className="table-skeleton">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} height="54px" />
          ))}
        </div>
      ) : (
        <DataTable
          value={products}
          lazy
          paginator
          first={page * 10}
          rows={10}
          totalRecords={total}
          onPage={(event: DataTablePageEvent) => setPage((event.first ?? 0) / (event.rows ?? 10))}
          sortField={sort.field}
          sortOrder={sort.order}
          onSort={(event: DataTableSortEvent) =>
            setSort({ field: event.sortField as string, order: (event.sortOrder ?? 1) as 1 | -1 })
          }
          emptyMessage="Товары не найдены. Измените фильтры или добавьте первый товар."
          stripedRows
        >
          <Column body={image} header="" style={{ width: '68px' }} />
          <Column field="name" header="Название" sortable />
          <Column field="category.name" header="Категория" />
          <Column
            field="price"
            header="Цена"
            sortable
            body={(product: Product) => money(product.price)}
          />
          <Column
            field="createdAt"
            header="Добавлен"
            sortable
            body={(product: Product) => new Date(product.createdAt).toLocaleDateString('ru-RU')}
          />
          <Column body={actions} header="" style={{ width: '150px' }} />
        </DataTable>
      )}
      <ProductDialog
        product={editing ?? null}
        visible={editing !== undefined}
        onHide={() => setEditing(undefined)}
        onSaved={(message) => {
          notify('success', message);
          load();
        }}
      />
      <CategoryDialog
        visible={categoryDialog}
        onHide={() => setCategoryDialog(false)}
        onSaved={() => {
          notify('success', 'Категория создана');
          loadCategories();
        }}
      />
    </section>
  );
}
