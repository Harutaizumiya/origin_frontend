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
    `BARCODE 24,82,"128",58,1,0,2,2,"${escapeTspl(text(payload.barcode, payload.batchCode))}"`,
    `TEXT 24,154,"TSS24.BF2",0,1,1,"数量 ${escapeTspl(text(payload.quantity))}  库位 ${escapeTspl(text(payload.location))}"`,
    `TEXT 24,184,"TSS24.BF2",0,1,1,"到期 ${escapeTspl(text(payload.expireDate))}  ${escapeTspl(text(payload.statusLabel))}"`,
    `TEXT 24,214,"TSS24.BF2",0,1,1,"厂商 ${escapeTspl(text(payload.manufacturer))}"`,
    `PRINT ${copies},1`,
  ];

  return `${rows.join("\r\n")}\r\n`;
}

function buildZplCommand(payload: LabelPrintPayload, options: LabelPrinterOptions) {
  const copies = clamp(Math.floor(options.copies), 1, 99);
  const width = mmToDots(options.labelWidthMm);
  const height = mmToDots(options.labelHeightMm);
  const barcodeValue = escapeZpl(text(payload.barcode, payload.batchCode));
  const rows = [
    "^XA",
    "^CI28",
    `^PW${width}`,
    `^LL${height}`,
    `^FO24,18^A0N,28,28^FD${escapeZpl(text(payload.productName))}^FS`,
    `^FO24,52^A0N,22,22^FD批次 ${escapeZpl(text(payload.batchCode))}^FS`,
    "^BY2,2,58",
    `^FO24,82^BCN,58,Y,N,N^FD${barcodeValue}^FS`,
    `^FO24,168^A0N,22,22^FD数量 ${escapeZpl(text(payload.quantity))}  库位 ${escapeZpl(text(payload.location))}^FS`,
    `^FO24,198^A0N,22,22^FD到期 ${escapeZpl(text(payload.expireDate))}  ${escapeZpl(text(payload.statusLabel))}^FS`,
    `^FO24,228^A0N,22,22^FD厂商 ${escapeZpl(text(payload.manufacturer))}^FS`,
    `^PQ${copies}`,
    "^XZ",
  ];

  return rows.join("\n");
}

function buildEscPosCommand(payload: LabelPrintPayload, options: LabelPrinterOptions) {
  const copies = clamp(Math.floor(options.copies), 1, 99);
  const barcode = text(payload.barcode, payload.batchCode);
  const body = [
    "\x1B@",
    "\x1Ba\x00",
    "\x1B!\x20",
    `${text(payload.productName)}\n`,
    "\x1B!\x00",
    `批次 ${text(payload.batchCode)}\n`,
    `数量 ${text(payload.quantity)}  库位 ${text(payload.location)}\n`,
    `生产 ${text(payload.manufactureDate)}\n`,
    `到期 ${text(payload.expireDate)}  ${text(payload.statusLabel)}\n`,
    `厂商 ${text(payload.manufacturer)}\n`,
    "\n",
    "\x1Da\x01",
    "\x1DhP",
    "\x1Dw\x02",
    `\x1DkI${String.fromCharCode(barcode.length)}${barcode}`,
    "\n\n\x1DV\x00",
  ].join("");

  return Array.from({ length: copies }, () => body).join("");
}

export function buildLabelPrintCommand(payload: LabelPrintPayload, options: LabelPrinterOptions) {
  if (options.protocol === "zpl") {
    return encode(buildZplCommand(payload, options));
  }

  if (options.protocol === "escpos") {
    return encode(buildEscPosCommand(payload, options));
  }

  return encode(buildTsplCommand(payload, options));
}

function getPrintableHtml(payload: LabelPrintPayload, options: LabelPrinterOptions) {
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
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 1mm 2mm; font-size: 7.5pt; }
    .barcode { margin-top: 1mm; border: 1px solid #111; padding: 1.5mm; text-align: center; font: 700 11pt monospace; letter-spacing: 1px; }
    .batch { font-size: 8.5pt; font-weight: 700; }
  </style>
</head>
<body>
  ${Array.from({ length: clamp(Math.floor(options.copies), 1, 99) })
    .map(
      () => `<section class="label">
        <h1>${safe(payload.productName)}</h1>
        <div class="batch">批次 ${safe(payload.batchCode)}</div>
        <div class="barcode">${safe(text(payload.barcode, payload.batchCode))}</div>
        <div class="meta">
          <span>数量 ${safe(payload.quantity)}</span>
          <span>库位 ${safe(payload.location)}</span>
          <span>生产 ${safe(payload.manufactureDate)}</span>
          <span>到期 ${safe(payload.expireDate)}</span>
          <span>分类 ${safe(payload.category)}</span>
          <span>${safe(payload.statusLabel)}</span>
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
  printWindow.document.write(getPrintableHtml(payload, options));
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
