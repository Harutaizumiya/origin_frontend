import React, { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { MainLayout } from "./components/layout/MainLayout";

const LoginPage = lazy(() => import("./components/pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import("./components/pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const ProductManagementPage = lazy(() =>
  import("./components/pages/ProductManagementPage").then((module) => ({ default: module.ProductManagementPage })),
);
const InventoryStatusPage = lazy(() =>
  import("./components/pages/InventoryStatusPage").then((module) => ({ default: module.InventoryStatusPage })),
);
const LossReportPage = lazy(() => import("./components/pages/LossReportPage").then((module) => ({ default: module.LossReportPage })));
const AnalyticsPage = lazy(() => import("./components/pages/AnalyticsPage").then((module) => ({ default: module.AnalyticsPage })));
const SettingsPage = lazy(() => import("./components/pages/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const QrScanPage = lazy(() => import("./components/pages/QrScanPage").then((module) => ({ default: module.QrScanPage })));

function PageFallback() {
  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-container-high border-t-primary" />
    </div>
  );
}

function LayoutWrapper() {
  return (
    <ErrorBoundary>
      <MainLayout>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </MainLayout>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route
            path="/login"
            element={
              <Suspense fallback={<PageFallback />}>
                <LoginPage />
              </Suspense>
            }
          />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutWrapper />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductManagementPage />} />
            <Route path="/inventory-status" element={<InventoryStatusPage />} />
            <Route path="/loss-report" element={<LossReportPage />} />
            <Route path="/qr-scan" element={<QrScanPage />} />
            <Route path="/analysis" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
