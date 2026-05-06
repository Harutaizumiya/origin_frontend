import type { BatchListParams } from "./batches";
import type { ProductListParams } from "./products";

export const queryKeys = {
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (params: ProductListParams = {}) => [...queryKeys.products.lists(), params] as const,
    categories: () => [...queryKeys.products.all, "categories"] as const,
  },
  batches: {
    all: ["batches"] as const,
    lists: () => [...queryKeys.batches.all, "list"] as const,
    list: (params: BatchListParams = {}) => [...queryKeys.batches.lists(), params] as const,
    product: (productId: number) => [...queryKeys.batches.all, "product", productId] as const,
    byProduct: (productId: number, params: Omit<BatchListParams, "product_id"> = {}) =>
      [...queryKeys.batches.product(productId), params] as const,
  },
};
