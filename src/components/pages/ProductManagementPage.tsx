import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { INITIAL_PRODUCTS } from "./ProductManagement.mock";
import type { Product, ProductFilters, ProductFormInput } from "./ProductManagement.types";

const PAGE_SIZE = 8;

const EMPTY_FORM: ProductFormInput = {
  barcode: "",
  product_name: "",
  shelf_life_days: "",
  location: "",
  category: "",
  unit: "",
  manufacturer: "",
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeText(value: string | null) {
  return value?.trim() || "未填写";
}

function normalizeSearchValue(value: string | null) {
  return value?.trim().toLowerCase() || "";
}

function getUniqueOptions(values: Array<string | null>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))).sort(
    (left, right) => left.localeCompare(right, "zh-CN"),
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-surface-container-high pt-6">
      <div className="text-sm text-on-surface-variant">
        第 <span className="font-bold text-on-surface">{currentPage}</span> / {totalPages} 页
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          上一页
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={cn(
              "h-10 w-10 rounded-xl text-sm font-bold transition-all",
              page === currentPage
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:text-primary",
            )}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          下一页
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function ProductFormModal({
  open,
  product,
  form,
  barcodeError,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  product: Product | null;
  form: ProductFormInput;
  barcodeError: string | null;
  onChange: (field: keyof ProductFormInput, value: string) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
      <div className="ambient-shadow relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-surface-container/10 bg-surface-container-lowest">
        <div className="flex items-start justify-between border-b border-surface-container-high px-8 py-6">
          <div>
            <h3 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
              {product ? "编辑货物" : "新增货物"}
            </h3>
            <p className="mt-1 text-sm text-on-surface-variant">维护货物主数据，更新后会立即反映在当前列表中。</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 px-8 py-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-on-surface">条码 *</span>
              <input
                required
                value={form.barcode}
                onChange={(event) => onChange("barcode", event.target.value)}
                className={cn(
                  "w-full rounded-2xl border bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15",
                  barcodeError ? "border-red-300" : "border-slate-200",
                )}
                placeholder="输入唯一条码"
              />
              {barcodeError && <div className="text-xs font-semibold text-red-500">{barcodeError}</div>}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-on-surface">货物名称 *</span>
              <input
                required
                value={form.product_name}
                onChange={(event) => onChange("product_name", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="输入货物名称"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-on-surface">厂商 *</span>
              <input
                required
                value={form.manufacturer}
                onChange={(event) => onChange("manufacturer", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="输入厂商名称"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-on-surface">保质期天数 *</span>
              <input
                required
                type="number"
                min={1}
                step={1}
                value={form.shelf_life_days}
                onChange={(event) => onChange("shelf_life_days", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="输入正整数"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-on-surface">分类</span>
              <input
                value={form.category}
                onChange={(event) => onChange("category", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="例如：乳制品"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-on-surface">库位</span>
              <input
                value={form.location}
                onChange={(event) => onChange("location", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="例如：冷库 A-01"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-on-surface">单位</span>
              <input
                value={form.unit}
                onChange={(event) => onChange("unit", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="例如：盒 / 袋 / 瓶"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-surface-container-high pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg"
            >
              {product ? "保存修改" : "创建货物"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  product,
  onCancel,
  onConfirm,
}: {
  product: Product | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]">
      <div className="ambient-shadow w-full max-w-md rounded-[2rem] border border-surface-container/10 bg-surface-container-lowest p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <Trash2 size={24} />
        </div>
        <h3 className="text-center font-headline text-2xl font-extrabold tracking-tight text-on-surface">删除货物</h3>
        <p className="mt-3 text-center text-sm leading-6 text-on-surface-variant">
          确认删除 <span className="font-bold text-on-surface">{product.product_name}</span> 吗？此操作会立即从当前列表中移除该货物。
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl border border-red-300 px-5 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}

export const ProductManagementPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [filters, setFilters] = useState<ProductFilters>({
    category: "",
    location: "",
    unit: "",
    query: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormInput>(EMPTY_FORM);

  const categoryOptions = useMemo(() => getUniqueOptions(products.map((product) => product.category)), [products]);
  const locationOptions = useMemo(() => getUniqueOptions(products.map((product) => product.location)), [products]);
  const unitOptions = useMemo(() => getUniqueOptions(products.map((product) => product.unit)), [products]);

  const filteredProducts = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesLocation = !filters.location || product.location === filters.location;
      const matchesUnit = !filters.unit || product.unit === filters.unit;
      const matchesQuery =
        !query ||
        normalizeSearchValue(product.product_name).includes(query) ||
        normalizeSearchValue(product.barcode).includes(query) ||
        normalizeSearchValue(product.manufacturer).includes(query);

      return matchesCategory && matchesLocation && matchesUnit && matchesQuery;
    });
  }, [filters, products]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedProducts = filteredProducts.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setBarcodeError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setBarcodeError(null);
    setForm({
      barcode: product.barcode,
      product_name: product.product_name,
      shelf_life_days: String(product.shelf_life_days),
      location: product.location ?? "",
      category: product.category ?? "",
      unit: product.unit ?? "",
      manufacturer: product.manufacturer,
    });
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setBarcodeError(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (field: keyof ProductFormInput, value: string) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    if (field === "barcode") {
      setBarcodeError(null);
    }
  };

  const handleFilterChange = (field: keyof ProductFilters, value: string) => {
    setFilters((currentFilters) => ({ ...currentFilters, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      location: "",
      unit: "",
      query: "",
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.barcode.trim() || !form.product_name.trim() || !form.manufacturer.trim() || !form.shelf_life_days.trim()) {
      return;
    }

    const shelfLife = Number(form.shelf_life_days);
    if (!Number.isInteger(shelfLife) || shelfLife <= 0) {
      return;
    }

    const normalizedBarcode = form.barcode.trim();
    const duplicateBarcode = products.some(
      (product) => product.barcode === normalizedBarcode && product.id !== editingProduct?.id,
    );

    if (duplicateBarcode) {
      setBarcodeError("条码已存在，请使用唯一条码。");
      return;
    }

    const timestamp = new Date().toISOString();

    if (editingProduct) {
      const nextProduct: Product = {
        ...editingProduct,
        barcode: normalizedBarcode,
        product_name: form.product_name.trim(),
        shelf_life_days: shelfLife,
        location: form.location.trim() || null,
        category: form.category.trim() || null,
        unit: form.unit.trim() || null,
        manufacturer: form.manufacturer.trim(),
        updated_at: timestamp,
      };

      setProducts((currentProducts) =>
        currentProducts.map((product) => (product.id === editingProduct.id ? nextProduct : product)),
      );
    } else {
      const nextId = products.reduce((highest, product) => Math.max(highest, product.id), 0) + 1;
      const nextProduct: Product = {
        id: nextId,
        barcode: normalizedBarcode,
        product_name: form.product_name.trim(),
        shelf_life_days: shelfLife,
        location: form.location.trim() || null,
        category: form.category.trim() || null,
        unit: form.unit.trim() || null,
        manufacturer: form.manufacturer.trim(),
        created_at: timestamp,
        updated_at: timestamp,
      };

      setProducts((currentProducts) => [nextProduct, ...currentProducts]);
    }

    closeFormModal();
  };

  const handleDelete = () => {
    if (!productToDelete) {
      return;
    }

    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productToDelete.id));
    setProductToDelete(null);
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">货物管理</h2>
          <p className="mt-1 text-on-surface-variant">维护产品主数据，支持查询、筛选、新增、编辑与删除货物信息。</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg"
        >
          <Plus size={18} />
          新增货物
        </button>
      </div>

      <section className="ambient-shadow mb-8 rounded-3xl border border-surface-container/10 bg-surface-container-lowest p-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_repeat(3,minmax(0,0.55fr))_auto]">
          <label className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={filters.query}
              onChange={(event) => handleFilterChange("query", event.target.value)}
              placeholder="搜索货物名称、条码或厂商"
              className="w-full rounded-2xl border border-slate-200 bg-surface-container-low py-3 pl-11 pr-4 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <select
            value={filters.category}
            onChange={(event) => handleFilterChange("category", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">全部分类</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={filters.location}
            onChange={(event) => handleFilterChange("location", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">全部库位</option>
            {locationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={filters.unit}
            onChange={(event) => handleFilterChange("unit", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">全部单位</option>
            {unitOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low"
          >
            <RotateCcw size={16} />
            重置筛选
          </button>
        </div>
      </section>

      <section className="ambient-shadow overflow-hidden rounded-3xl border border-surface-container/10 bg-surface-container-lowest">
        <div className="flex flex-col gap-3 border-b border-surface-container-high p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-headline text-xl font-bold text-on-surface">货物列表</h3>
            <p className="mt-1 text-sm text-on-surface-variant">当前筛选结果共 {filteredProducts.length} 条货物记录。</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
            <PackageSearch size={16} />
            支持按名称、条码、厂商快速检索
          </div>
        </div>

        {pagedProducts.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">货物名称</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">条码</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">厂商</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">分类</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">库位</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">单位</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">保质期天数</th>
                    <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">更新时间</th>
                    <th className="px-8 py-4 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {pagedProducts.map((product) => (
                    <tr key={product.id} className="transition-colors hover:bg-surface-container-low/30">
                      <td className="px-8 py-5">
                        <div className="font-bold text-on-surface">{product.product_name}</div>
                        <div className="mt-1 text-xs text-on-surface-variant">ID #{product.id}</div>
                      </td>
                      <td className="px-8 py-5 text-sm font-mono text-on-surface-variant">{product.barcode}</td>
                      <td className="px-8 py-5 text-sm text-on-surface-variant">{product.manufacturer}</td>
                      <td className="px-8 py-5">
                        <span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
                          {normalizeText(product.category)}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-on-surface-variant">{normalizeText(product.location)}</td>
                      <td className="px-8 py-5 text-sm text-on-surface-variant">{normalizeText(product.unit)}</td>
                      <td className="px-8 py-5 text-sm font-semibold text-on-surface">{product.shelf_life_days} 天</td>
                      <td className="px-8 py-5 text-sm text-on-surface-variant">{formatDate(product.updated_at)}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-low"
                          >
                            <Pencil size={14} />
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-8 pb-8 pt-6">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 px-8 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
              <PackageSearch size={28} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-on-surface">未找到匹配的货物</h4>
              <p className="mt-1 text-sm text-on-surface-variant">可以尝试调整搜索关键词或重置筛选条件。</p>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low"
            >
              重置筛选
            </button>
          </div>
        )}
      </section>

      <ProductFormModal
        open={isFormOpen}
        product={editingProduct}
        form={form}
        barcodeError={barcodeError}
        onChange={handleFormChange}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmModal product={productToDelete} onCancel={() => setProductToDelete(null)} onConfirm={handleDelete} />
    </>
  );
};
