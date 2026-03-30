import React from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AnalyticsPage } from "./components/pages/AnalyticsPage";
import { DashboardPage } from "./components/pages/DashboardPage";
import { InventoryStatusPage } from "./components/pages/InventoryStatusPage";

function LayoutWrapper() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutWrapper />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventory-status" element={<InventoryStatusPage />} />
          <Route path="/analysis" element={<AnalyticsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
