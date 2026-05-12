import { requestJson } from "./client";

export type QrScanSource = "web_camera" | "mobile_camera" | "handheld";
export type QrScanStatus = "valid" | "near_expiry" | "expired" | "invalid" | "revoked" | "not_found";

export interface QrScanInput {
  qr: string;
  source: QrScanSource;
  deviceId?: string | null;
  clientScanId?: string | null;
  scannedAt?: string | null;
}

export interface QrScanResultDto {
  auditId: string;
  batchCode: string | null;
  productName: string | null;
  status: QrScanStatus;
  message: string;
  expireDate: string | null;
  remainingDays: number | null;
  clientScanId?: string | null;
}

export interface QrScanBulkInput {
  items: QrScanInput[];
}

export interface QrScanBulkResultDto {
  items: QrScanResultDto[];
}

export async function createQrScan(input: QrScanInput) {
  return requestJson<QrScanResultDto>("/qr-scans", {
    method: "POST",
    body: {
      qr: input.qr,
      source: input.source,
      deviceId: input.deviceId ?? null,
      clientScanId: input.clientScanId ?? null,
      scannedAt: input.scannedAt ?? null,
    },
  });
}

export async function createQrScanBulk(input: QrScanBulkInput) {
  return requestJson<QrScanBulkResultDto>("/qr-scans/bulk", {
    method: "POST",
    body: {
      items: input.items.map((item) => ({
        qr: item.qr,
        source: item.source,
        deviceId: item.deviceId ?? null,
        clientScanId: item.clientScanId ?? null,
        scannedAt: item.scannedAt ?? null,
      })),
    },
  });
}
