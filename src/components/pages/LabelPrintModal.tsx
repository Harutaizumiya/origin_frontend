import React, { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cable, CheckCircle2, LoaderCircle, MonitorUp, Printer, Usb, X } from "lucide-react";
import {
  DEFAULT_LABEL_PRINTER_OPTIONS,
  sendLabelPrintCommand,
  type LabelPrintPayload,
  type LabelPrinterOptions,
  type LabelPrinterProtocol,
  type LabelPrinterTransport,
} from "../../lib/labelPrinter";
import { cn } from "../../lib/utils";

interface LabelPrintModalProps {
  open: boolean;
  payload: LabelPrintPayload | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onRetry?: () => void;
}

interface PrintFeedback {
  type: "success" | "error";
  message: string;
}

const PROTOCOL_OPTIONS: Array<{ value: LabelPrinterProtocol; label: string; hint: string }> = [
  { value: "tspl", label: "TSPL", hint: "TSC、佳博等标签机常用" },
  { value: "zpl", label: "ZPL", hint: "Zebra 兼容标签机常用" },
  { value: "escpos", label: "ESC/POS", hint: "票据机和部分标签机兼容" },
  { value: "browser", label: "浏览器", hint: "系统打印对话框兜底" },
];

const TRANSPORT_OPTIONS: Array<{ value: LabelPrinterTransport; label: string; icon: React.ReactNode; hint: string }> = [
  { value: "webusb", label: "WebUSB", icon: <Usb size={16} />, hint: "USB 直连，浏览器会请求选择设备" },
  { value: "webserial", label: "WebSerial", icon: <Cable size={16} />, hint: "串口/USB 转串口，适合工业设备" },
  { value: "browser", label: "浏览器打印", icon: <MonitorUp size={16} />, hint: "不发原始指令，由系统驱动处理" },
];

export const LabelPrintModal: React.FC<LabelPrintModalProps> = ({ open, payload, loading = false, error = null, onClose, onRetry }) => {
  const [options, setOptions] = useState<LabelPrinterOptions>(DEFAULT_LABEL_PRINTER_OPTIONS);
  const [printing, setPrinting] = useState(false);
  const [feedback, setFeedback] = useState<PrintFeedback | null>(null);
  const canPrint = Boolean(payload?.qrCode.trim()) && !loading && !error;

  const effectiveOptions = useMemo<LabelPrinterOptions>(() => {
    if (options.transport === "browser") {
      return { ...options, protocol: "browser" };
    }

    if (options.protocol === "browser") {
      return { ...options, transport: "browser" };
    }

    return options;
  }, [options]);

  const updateOption = useCallback(<Key extends keyof LabelPrinterOptions>(key: Key, value: LabelPrinterOptions[Key]) => {
    setOptions((currentOptions) => ({ ...currentOptions, [key]: value }));
    setFeedback(null);
  }, []);

  const handlePrint = useCallback(async () => {
    if (!payload?.qrCode.trim()) {
      setFeedback({
        type: "error",
        message: "二维码凭证未加载，不能发送打印命令。",
      });
      return;
    }

    setPrinting(true);
    setFeedback(null);

    try {
      const result = await sendLabelPrintCommand(payload, effectiveOptions);
      setFeedback({
        type: "success",
        message: result.bytes ? `打印命令已发送，写入 ${result.bytes} bytes。` : "已打开系统打印流程。",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "打印失败，请检查打印机连接。",
      });
    } finally {
      setPrinting(false);
    }
  }, [effectiveOptions, payload]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-[3px]"
            onClick={printing ? undefined : onClose}
          />
          <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.section
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="ambient-shadow pointer-events-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-surface-container/10 bg-surface-container-lowest"
            >
              <div className="flex items-start justify-between border-b border-surface-container-high px-8 py-6">
                <div>
                  <h3 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">打印标签</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">发送热敏标签打印命令，支持常见原始协议和系统打印兜底。</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={printing}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-8 py-6">
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                    <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">协议</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {PROTOCOL_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateOption("protocol", option.value)}
                          className={cn(
                            "min-h-[78px] rounded-2xl border px-4 py-3 text-left transition-all",
                            effectiveOptions.protocol === option.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-slate-200 bg-white text-on-surface hover:border-primary/30",
                          )}
                        >
                          <div className="font-bold">{option.label}</div>
                          <div className="mt-1 text-xs text-on-surface-variant">{option.hint}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                    <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">通道</div>
                    <div className="space-y-3">
                      {TRANSPORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateOption("transport", option.value)}
                          className={cn(
                            "flex min-h-[64px] w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
                            effectiveOptions.transport === option.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-slate-200 bg-white text-on-surface hover:border-primary/30",
                          )}
                        >
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">{option.icon}</span>
                          <span>
                            <span className="block font-bold">{option.label}</span>
                            <span className="mt-0.5 block text-xs text-on-surface-variant">{option.hint}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-on-surface">宽度 mm</span>
                    <input
                      type="number"
                      min={20}
                      max={120}
                      value={effectiveOptions.labelWidthMm}
                      onChange={(event) => updateOption("labelWidthMm", Number(event.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-on-surface">高度 mm</span>
                    <input
                      type="number"
                      min={15}
                      max={100}
                      value={effectiveOptions.labelHeightMm}
                      onChange={(event) => updateOption("labelHeightMm", Number(event.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-on-surface">间隙 mm</span>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={effectiveOptions.gapMm}
                      onChange={(event) => updateOption("gapMm", Number(event.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-on-surface">浓度</span>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={effectiveOptions.density}
                      onChange={(event) => updateOption("density", Number(event.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-on-surface">份数</span>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={effectiveOptions.copies}
                      onChange={(event) => updateOption("copies", Number(event.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                </section>

                {effectiveOptions.transport === "webserial" ? (
                  <label className="block max-w-xs space-y-2">
                    <span className="text-sm font-semibold text-on-surface">串口波特率</span>
                    <input
                      type="number"
                      min={1200}
                      step={1200}
                      value={effectiveOptions.baudRate}
                      onChange={(event) => updateOption("baudRate", Number(event.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                ) : null}

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">标签预览数据</div>
                  {loading ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm font-semibold text-on-surface-variant">
                      <LoaderCircle size={18} className="animate-spin" />
                      正在从后端加载二维码凭证...
                    </div>
                  ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
                      <div className="font-bold">二维码凭证加载失败</div>
                      <div className="mt-1">{error}</div>
                      {onRetry ? (
                        <button
                          type="button"
                          onClick={onRetry}
                          className="mt-3 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                        >
                          重新加载
                        </button>
                      ) : null}
                    </div>
                  ) : payload ? (
                    <div className="grid gap-3 text-sm text-on-surface-variant md:grid-cols-2">
                      <div className="font-bold text-on-surface">{payload.productName}</div>
                      <div>条码 {payload.barcode || payload.batchCode}</div>
                      <div>批次 {payload.batchCode}</div>
                      <div>数量 {payload.quantity}</div>
                      <div>库位 {payload.location}</div>
                      <div>到期 {payload.expireDate}</div>
                      <div className="font-semibold text-emerald-700">二维码凭证已加载</div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-on-surface-variant">
                      尚未加载标签数据。
                    </div>
                  )}
                  {effectiveOptions.protocol === "escpos" ? (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                      ESC/POS 二维码指令存在机型差异；若设备不响应，请切换 TSPL、ZPL 或浏览器打印。
                    </div>
                  ) : null}
                </section>

                {feedback ? (
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold",
                      feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-600",
                    )}
                  >
                    {feedback.type === "success" ? <CheckCircle2 size={16} /> : <Printer size={16} />}
                    {feedback.message}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col items-stretch justify-end gap-3 border-t border-surface-container-high bg-white/80 p-6 backdrop-blur-sm sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={printing}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={printing || !canPrint}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {printing ? <LoaderCircle size={16} className="animate-spin" /> : <Printer size={16} />}
                  发送打印命令
                </button>
              </div>
            </motion.section>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
};
