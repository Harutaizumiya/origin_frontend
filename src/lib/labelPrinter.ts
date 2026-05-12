import QRCode from "qrcode";

export type LabelPrinterProtocol = "tspl" | "zpl" | "escpos" | "browser";
export type LabelPrinterTransport = "webusb" | "webserial" | "browser";

export interface LabelPrintPayload {
  productName: string;
  barcode: string;
  batchCode: string;
  quantity: string;
  category: string;
  location: string;
  manufacturer: string;
  manufactureDate: string;
  expireDate: string;
  receivedDate: string;
  statusLabel: string;
  qrCode: string;
}

export interface LabelPrinterOptions {
  protocol: LabelPrinterProtocol;
  transport: LabelPrinterTransport;
  copies: number;
  labelWidthMm: number;
  labelHeightMm: number;
  gapMm: number;
  density: number;
  baudRate: number;
}

export interface LabelPrintResult {
  transport: LabelPrinterTransport;
  protocol: LabelPrinterProtocol;
  bytes?: number;
}

const MM_TO_DOTS_203_DPI = 8;

interface UsbNavigator {
  requestDevice(options: { filters: USBDeviceFilter[] }): Promise<USBDevice>;
}

export const DEFAULT_LABEL_PRINTER_OPTIONS: LabelPrinterOptions = {
  protocol: "tspl",
  transport: "webusb",
  copies: 1,
  labelWidthMm: 60,
  labelHeightMm: 40,
  gapMm: 2,
  density: 8,
  baudRate: 9600,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function text(value: string | null | undefined, fallback = "-") {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

function escapeTspl(value: string) {
  return value.replace(/"/g, "'");
}

function escapeZpl(value: string) {
  return value.replace(/\^/g, " ").replace(/~/g, " ");
}

function mmToDots(value: number) {
  return Math.round(value * MM_TO_DOTS_203_DPI);
}

function encode(command: string) {
  return new TextEncoder().encode(command);
}

function assertQrCode(payload: LabelPrintPayload) {
  if (!payload.qrCode.trim()) {
    throw new Error("二维码凭证未加载，不能发送打印命令。");
  }
}

function concatBytes(chunks: Array<Uint8Array | number[]>) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.length;
  });

  return output;
}

function buildTsplCommand(payload: LabelPrintPayload, options: LabelPrinterOptions) {
  const copies = clamp(Math.floor(options.copies), 1, 99);
  const density = clamp(Math.floor(options.density), 1, 15);
  const rows = [
    `SIZE ${options.labelWidthMm} mm,${options.labelHeightMm} mm`,
    `GAP ${options.gapMm} mm,0 mm`,
    `DENSITY ${density}`,
    "DIRECTION 1",
    "REFERENCE 0,0",
    "CLS",
    `TEXT 24,18,"TSS24.BF2",0,1,1,"${escapeTspl(text(payload.productName))}"`,
    `TEXT 24,50,"TSS24.BF2",0,1,1,"批次 ${escapeTspl(text(payload.batchCode))}"`,
    `QRCODE 352,76,L,4,A,0,"${escapeTspl(text(payload.qrCode))}"`,
    `BARCODE 24,84,"128",54,1,0,2,2,"${escapeTspl(text(payload.barcode, payload.batchCode))}"`,
    `TEXT 24,156,"TSS24.BF2",0,1,1,"数量 ${escapeTspl(text(payload.quantity))}  库位 ${escapeTspl(text(payload.location))}"`,
    `TEXT 24,186,"TSS24.BF2",0,1,1,"到期 ${escapeTspl(text(payload.expireDate))}  ${escapeTspl(text(payload.statusLabel))}"`,
    `TEXT 24,216,"TSS24.BF2",0,1,1,"二维码凭证已加载"`,
    `PRINT ${copies},1`,
  ];

  return `${rows.join("\r\n")}\r\n`;
}

function buildZplCommand(payload: LabelPrintPayload, options: LabelPrinterOptions) {
  const copies = clamp(Math.floor(options.copies), 1, 99);
  const width = mmToDots(options.labelWidthMm);
  const height = mmToDots(options.labelHeightMm);
  const barcodeValue = escapeZpl(text(payload.barcode, payload.batchCode));
  const qrValue = escapeZpl(text(payload.qrCode));
  const rows = [
    "^XA",
    "^CI28",
    `^PW${width}`,
    `^LL${height}`,
    `^FO24,18^A0N,28,28^FD${escapeZpl(text(payload.productName))}^FS`,
    `^FO24,52^A0N,22,22^FD批次 ${escapeZpl(text(payload.batchCode))}^FS`,
    `^FO352,76^BQN,2,4^FDLA,${qrValue}^FS`,
    "^BY2,2,58",
    `^FO24,82^BCN,58,Y,N,N^FD${barcodeValue}^FS`,
    `^FO24,168^A0N,22,22^FD数量 ${escapeZpl(text(payload.quantity))}  库位 ${escapeZpl(text(payload.location))}^FS`,
    `^FO24,198^A0N,22,22^FD到期 ${escapeZpl(text(payload.expireDate))}  ${escapeZpl(text(payload.statusLabel))}^FS`,
    `^FO24,228^A0N,22,22^FD二维码凭证已加载^FS`,
    `^PQ${copies}`,
    "^XZ",
  ];

  return rows.join("\n");
}

function buildEscPosQrStoreCommand(value: string) {
  const qrBytes = encode(value);
  const length = qrBytes.length + 3;
  const pL = length % 256;
  const pH = Math.floor(length / 256);

  return concatBytes([[0x1d, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30], qrBytes]);
}

function buildEscPosCommand(payload: LabelPrintPayload, options: LabelPrinterOptions) {
  const copies = clamp(Math.floor(options.copies), 1, 99);
  const barcode = text(payload.barcode, payload.batchCode);
  const barcodeBytes = encode(barcode);
  const body = concatBytes([
    [0x1b, 0x40, 0x1b, 0x61, 0x00, 0x1b, 0x21, 0x20],
    encode(`${text(payload.productName)}\n`),
    [0x1b, 0x21, 0x00],
    encode(`批次 ${text(payload.batchCode)}\n`),
    encode(`数量 ${text(payload.quantity)}  库位 ${text(payload.location)}\n`),
    encode(`到期 ${text(payload.expireDate)}  ${text(payload.statusLabel)}\n`),
    encode("二维码凭证已加载\n\n"),
    [0x1b, 0x61, 0x01],
    [0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00],
    [0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x06],
    [0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31],
    buildEscPosQrStoreCommand(text(payload.qrCode)),
    [0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30],
    encode("\n"),
    [0x1d, 0x68, 0x50, 0x1d, 0x77, 0x02, 0x1d, 0x6b, 0x49, barcodeBytes.length],
    barcodeBytes,
    [0x0a, 0x0a, 0x1d, 0x56, 0x00],
  ]);

  return concatBytes(Array.from({ length: copies }, () => body));
}

export function buildLabelPrintCommand(payload: LabelPrintPayload, options: LabelPrinterOptions) {
  assertQrCode(payload);

  if (options.protocol === "zpl") {
    return encode(buildZplCommand(payload, options));
  }

  if (options.protocol === "escpos") {
    return buildEscPosCommand(payload, options);
  }

  return encode(buildTsplCommand(payload, options));
}

export async function buildBrowserLabelHtml(payload: LabelPrintPayload, options: LabelPrinterOptions) {
  assertQrCode(payload);

  const qrCodeDataUrl = await QRCode.toDataURL(text(payload.qrCode), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 160,
  });
  const safe = (value: string) =>
    text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>标签打印</title>
  <style>
    @page { size: ${options.labelWidthMm}mm ${options.labelHeightMm}mm; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, "Microsoft YaHei", sans-serif; color: #111; }
    .label {
      width: ${options.labelWidthMm}mm;
      height: ${options.labelHeightMm}mm;
      padding: 3mm;
      display: flex;
      flex-direction: column;
      gap: 1.5mm;
      page-break-after: always;
    }
    h1 { margin: 0; font-size: 13pt; line-height: 1.2; }
    .body { display: grid; grid-template-columns: minmax(0, 1fr) 19mm; gap: 2mm; align-items: start; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 1mm 2mm; font-size: 7.5pt; }
    .barcode { margin-top: 1mm; border: 1px solid #111; padding: 1.5mm; text-align: center; font: 700 11pt monospace; letter-spacing: 1px; }
    .batch { font-size: 8.5pt; font-weight: 700; }
    .qr { width: 19mm; height: 19mm; object-fit: contain; }
    .qr-caption { font-size: 6.5pt; text-align: center; font-weight: 700; }
  </style>
</head>
<body>
  ${Array.from({ length: clamp(Math.floor(options.copies), 1, 99) })
    .map(
      () => `<section class="label">
        <h1>${safe(payload.productName)}</h1>
        <div class="batch">批次 ${safe(payload.batchCode)}</div>
        <div class="body">
          <div>
            <div class="barcode">${safe(text(payload.barcode, payload.batchCode))}</div>
            <div class="meta">
              <span>数量 ${safe(payload.quantity)}</span>
              <span>库位 ${safe(payload.location)}</span>
              <span>生产 ${safe(payload.manufactureDate)}</span>
              <span>到期 ${safe(payload.expireDate)}</span>
              <span>分类 ${safe(payload.category)}</span>
              <span>${safe(payload.statusLabel)}</span>
            </div>
          </div>
          <div>
            <img class="qr" src="${qrCodeDataUrl}" alt="二维码凭证" />
            <div class="qr-caption">凭证已加载</div>
          </div>
        </div>
        <div class="meta"><span>厂商 ${safe(payload.manufacturer)}</span><span>收货 ${safe(payload.receivedDate)}</span></div>
      </section>`,
    )
    .join("")}
  <script>window.addEventListener("load", () => { window.focus(); window.print(); });</script>
</body>
</html>`;
}

async function printViaBrowser(payload: LabelPrintPayload, options: LabelPrinterOptions) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=480,height=640");

  if (!printWindow) {
    throw new Error("浏览器阻止了打印窗口，请允许弹窗后重试。");
  }

  printWindow.document.open();
  printWindow.document.write(await buildBrowserLabelHtml(payload, options));
  printWindow.document.close();
}

async function printViaSerial(command: Uint8Array, options: LabelPrinterOptions) {
  if (!("serial" in navigator)) {
    throw new Error("当前浏览器不支持 Web Serial，请使用 Chromium 系浏览器或选择浏览器打印。");
  }

  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: options.baudRate });

  try {
    const writer = port.writable?.getWriter();
    if (!writer) {
      throw new Error("串口不可写，请检查打印机连接。");
    }

    try {
      await writer.write(command);
    } finally {
      writer.releaseLock();
    }
  } finally {
    await port.close();
  }
}

async function printViaUsb(command: Uint8Array) {
  if (!("usb" in navigator)) {
    throw new Error("当前浏览器不支持 WebUSB，请使用 Chromium 系浏览器或选择浏览器打印。");
  }

  const usb = navigator.usb as UsbNavigator;
  const device = await usb.requestDevice({ filters: [] });
  await device.open();

  try {
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }

    const configuration = device.configuration;
    const candidate = configuration?.interfaces
      .flatMap((usbInterface) =>
        usbInterface.alternates.map((alternate) => ({
          interfaceNumber: usbInterface.interfaceNumber,
          alternateSetting: alternate.alternateSetting,
          endpoint: alternate.endpoints.find((endpoint) => endpoint.direction === "out" && endpoint.type === "bulk"),
        })),
      )
      .find((entry) => entry.endpoint);

    if (!candidate?.endpoint) {
      throw new Error("未找到可写入的 USB bulk out 端点。");
    }

    await device.claimInterface(candidate.interfaceNumber);

    if (candidate.alternateSetting !== 0) {
      await device.selectAlternateInterface(candidate.interfaceNumber, candidate.alternateSetting);
    }

    try {
      await device.transferOut(candidate.endpoint.endpointNumber, command);
    } finally {
      await device.releaseInterface(candidate.interfaceNumber);
    }
  } finally {
    await device.close();
  }
}

export async function sendLabelPrintCommand(payload: LabelPrintPayload, options: LabelPrinterOptions): Promise<LabelPrintResult> {
  if (options.transport === "browser" || options.protocol === "browser") {
    await printViaBrowser(payload, options);
    return { transport: "browser", protocol: "browser" };
  }

  const command = buildLabelPrintCommand(payload, options);

  if (options.transport === "webserial") {
    await printViaSerial(command, options);
  } else {
    await printViaUsb(command);
  }

  return {
    transport: options.transport,
    protocol: options.protocol,
    bytes: command.byteLength,
  };
}
