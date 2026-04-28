import type { ApiListData } from "./types";
import { requestJson } from "./client";

export type ExpiryStatus = "expired" | "critical" | "warning" | "normal";

export interface ProductSummaryDto {
  id: number;
  barcode: string;
  product_name: string;
  unit: string | null;
  manufacturer: string;
  shelf_life_days?: number;
}

export interface BatchDto {
  id: number;
  product_id: number;
  batch_code: string;
  quantity: string;
  received_at: string;
  manufacture_date: string | null;
  expire_date: string | null;
  status: string | null;
  remarks: string | null;
  days_until_expiry?: number | null;
  expiry_progress?: number | null;
  expiry_status?: ExpiryStatus;
  product: ProductSummaryDto;
}

export interface BatchListParams {
  product_id?: number;
  status?: string;
  expired_only?: boolean;
  page?: number;
  size?: number;
}

export interface ExpiryAlertQuery {
  product_id?: number;
  status?: string;
  category?: string;
  location?: string;
  expiry_status?: ExpiryStatus;
  days_lte?: number;
  include_expired?: boolean;
  page?: number;
  size?: number;
}

export interface BatchMutationInput {
  product_id: number;
  batch_code?: string;
  quantity: string;
  manufacture_date: string;
  expire_date?: string | null;
  status?: string | null;
  remarks?: string | null;
}

function buildQuery(params: BatchListParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function listBatches(params: BatchListParams = {}) {
  return requestJson<ApiListData<BatchDto>>(`/batches${buildQuery(params)}`);
}

export async function listExpiryAlerts(params: ExpiryAlertQuery = {}) {
  return requestJson<ApiListData<BatchDto>>(`/batches/expiry-alerts${buildQuery(params)}`);
}

export async function createBatch(input: BatchMutationInput) {
  return requestJson<BatchDto>("/batches", {
    method: "POST",
    body: {
      product_id: input.product_id,
      ...(input.batch_code ? { batch_code: input.batch_code.trim() } : {}),
      quantity: input.quantity,
      manufacture_date: input.manufacture_date,
      ...(input.expire_date !== undefined ? { expire_date: input.expire_date } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.remarks !== undefined ? { remarks: input.remarks } : {}),
    },
  });
}

export async function listProductBatches(productId: number, params: Omit<BatchListParams, "product_id"> = {}) {
  return requestJson<ApiListData<BatchDto>>(`/products/${productId}/batches${buildQuery(params)}`);
}
