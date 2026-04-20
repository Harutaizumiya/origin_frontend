# 项目结构说明

## 1. 项目概览

该项目是一个基于 `React 19 + TypeScript + Vite 6 + Tailwind CSS 4` 的前端单页应用，当前实现为一个食品库存管理后台原型。应用通过 `react-router-dom` 组织多个页面，整体采用“共享布局 + 页面组件 + 页面内部子组件”的结构。

从代码现状看，这个仓库更接近 **前端静态演示/中后台原型**，而不是已经接入后端接口的完整业务系统：

- 页面数据主要来自本地常量。
- 没有全局状态管理库。
- 没有 API service、hooks、store、request 层。
- 页面中的业务计算逻辑部分直接写在页面组件文件中。

## 2. 根目录结构

```text
origin_frontend/
├─ src/                         # 应用源码
├─ docs/                        # 项目文档（本文件所在目录）
├─ node_modules/                # 依赖目录
├─ .env.example                 # 环境变量示例
├─ .gitignore
├─ DEV.md                       # 旧开发文档，当前存在编码问题
├─ index.html                   # Vite HTML 模板
├─ metadata.json                # 项目元数据
├─ package.json                 # 依赖与脚本
├─ package-lock.json
├─ pnpm-lock.yaml
├─ preview-server.cjs           # 构建产物预览服务
├─ README.md                    # 基础运行说明
├─ tsconfig.json                # TypeScript 配置
└─ vite.config.ts               # Vite 配置
```

## 3. `src` 目录结构

```text
src/
├─ App.tsx                      # 路由注册与布局挂载
├─ main.tsx                     # React 应用入口
├─ index.css                    # 全局样式、主题变量、字体与基础 class
├─ components/
│  ├─ actions/                  # 浮动操作按钮等交互组件
│  ├─ charts/                   # 图表相关组件
│  ├─ common/                   # 通用展示型组件（徽标、状态等）
│  ├─ dashboard/                # 仪表盘首页专用组件
│  ├─ layout/                   # 页面框架、侧边栏、顶部栏、布局上下文
│  ├─ navigation/               # 导航组件
│  ├─ pages/                    # 页面级组件与库存页专属类型/弹窗
│  └─ tables/                   # 表格相关组件
├─ constants/
│  └─ mockData.ts               # 仪表盘页使用的本地模拟数据
├─ lib/
│  └─ utils.ts                  # `cn()` 等通用工具函数
└─ types/
   └─ inventory.ts              # 仪表盘相关的通用类型定义
```

## 4. 应用入口与运行链路

### 4.1 入口文件

- `src/main.tsx`
  - 挂载 React 根节点。
  - 引入全局样式 `src/index.css`。
  - 渲染 `App`。

- `src/App.tsx`
  - 使用 `BrowserRouter` 创建路由。
  - 通过 `LayoutWrapper` 将业务页面包裹到 `MainLayout` 中。
  - 当前注册了 3 个主页面：
    - `/` -> `DashboardPage`
    - `/inventory-status` -> `InventoryStatusPage`
    - `/analysis` -> `AnalyticsPage`
  - 未匹配路由统一重定向到首页。

### 4.2 页面加载关系

```text
main.tsx
  -> App.tsx
    -> BrowserRouter
      -> MainLayout
        -> Sidebar / Header
        -> 当前路由页面
```

## 5. 分层结构

### 5.1 布局层：`src/components/layout`

这一层负责应用壳，不负责具体业务数据。

- `MainLayout.tsx`
  - 维护侧边栏折叠状态 `collapsed`。
  - 维护侧边栏动画状态 `isSidebarAnimating`。
  - 通过 `LayoutProvider` 向下传递布局上下文。
  - 渲染统一的 `Sidebar`、`Header` 与主内容区域。

- `LayoutContext.tsx`
  - 提供 `sidebarCollapsed` 和 `isSidebarAnimating`。
  - 图表区域用它判断是否在侧栏动画期间显示 skeleton，避免重排时的图表闪动。

- `Sidebar.tsx`
  - 应用左侧导航容器。
  - 集成 `SidebarMenu`、`ProfileWidget` 和底部设置按钮。

- `Header.tsx`
  - 应用顶部栏。
  - 包含搜索框、通知/帮助按钮、系统标题与日期。

### 5.2 导航层：`src/components/navigation`

- `SidebarMenu.tsx`
  - 定义主导航项。
  - 当前导航与路由保持一一对应：总览、库存状态、分析。

- `SidebarItem.tsx`
  - 单个菜单项的展示与跳转。

- `ProfileWidget.tsx`
  - 侧边栏底部的用户资料区域。

### 5.3 页面层：`src/components/pages`

这一层是业务页面入口，也是当前仓库业务逻辑最集中的位置。

- `DashboardPage.tsx`
  - 首页容器。
  - 组合 `PageHeader`、`StatCardGrid`、`ChartGrid`、`TableSection`、`FloatingActionButtons`。
  - 本身几乎不含业务计算逻辑，偏页面装配。

- `AnalyticsPage.tsx`
  - 分析页。
  - 在文件内部直接定义图表数据、指标卡数据和效率表数据。
  - 同时包含页面结构和大量展示数据，属于“页面 + 本地数据耦合”的实现。

- `InventoryStatusPage.tsx`
  - 当前最重的业务页面。
  - 文件内同时承担：
    - 本地库存数据定义
    - 批次详情数据定义
    - 数量/日期格式化
    - 保质期计算
    - 风险分级
    - 排序逻辑
    - 分页逻辑
    - 卡片/列表视图切换
    - 弹窗开关控制
  - 该页面已经接近一个小型领域模块。

- `InventoryStatus.types.ts`
  - 为库存状态页定义专属类型。
  - 与 `src/types/inventory.ts` 的定位不同，这里是页面领域模型。

- `InventoryStatusCard.tsx`
  - 库存卡片视图中的单卡组件。

- `InventoryBatchDetailModal.tsx`
  - 批次详情弹窗。

### 5.4 页面子组件层

按页面类型拆分为多个目录：

- `dashboard/`
  - 首页专属卡片与页头组件。
- `charts/`
  - 趋势图、分布图、图表容器。
- `tables/`
  - 预警表格及行组件。
- `actions/`
  - 浮动操作按钮。
- `common/`
  - `StatusBadge`、`LocationBadge`、`TrendBadge` 等轻量复用组件。

这层主要负责展示，不持有全局状态。

## 6. 页面与组件映射

### 6.1 仪表盘首页 `/`

```text
DashboardPage
├─ PageHeader
├─ StatCardGrid
│  └─ StatCard
├─ ChartGrid
│  ├─ TrendChart
│  └─ DistributionChart
├─ TableSection
│  └─ UrgentTableRow
└─ FloatingActionButtons
```

数据来源：

- `StatCardGrid` 直接内嵌指标文案与数值。
- `ChartGrid` 下的图表组件使用 `constants/mockData.ts`。
- `TableSection` 使用 `URGENT_ITEMS`。

### 6.2 库存状态页 `/inventory-status`

```text
InventoryStatusPage
├─ InventoryOverviewCards
│  └─ StatCard
├─ ViewToggle
├─ InventoryCardView
│  └─ InventoryStatusCard
├─ InventoryListView
├─ Pagination
├─ InventoryBatchDetailModal
└─ FloatingActionButtons
```

特点：

- 计算逻辑集中在页面文件内部。
- 页面自身维护视图切换、分页与弹窗状态。
- 适合继续演化为独立业务模块。

### 6.3 分析页 `/analysis`

```text
AnalyticsPage
├─ AnalyticsMetrics
│  └─ StatCard
├─ AnalyticsCharts
│  ├─ Recharts BarChart（库存价值与损耗趋势）
│  └─ Recharts BarChart（品类吞吐量）
└─ EfficiencyTable
```

特点：

- 图表与指标数据直接定义在页面文件顶部。
- 页面结构清晰，但后续若继续增长，建议拆出 `data.ts` 或 `hooks`。

## 7. 数据与状态流

### 7.1 当前数据来源

当前没有请求后端接口，数据主要有两种来源：

- `src/constants/mockData.ts`
  - 供仪表盘图表和预警表格使用。

- 页面文件内局部常量
  - `AnalyticsPage.tsx` 内部定义分析页数据。
  - `InventoryStatusPage.tsx` 内部定义库存记录和详情数据。

### 7.2 状态分布

当前状态管理完全依赖 React 本地状态：

- 布局状态在 `MainLayout.tsx`
  - `collapsed`
  - `isSidebarAnimating`

- 库存状态页在 `InventoryStatusPage.tsx`
  - `view`
  - `currentPage`
  - `selectedItem`
  - `isDetailOpen`

这意味着当前结构适合中小规模静态页面，但当接口、筛选条件、跨页共享状态增加后，会开始变重。

## 8. 样式系统

### 8.1 全局样式入口

- `src/index.css`
  - 使用 Tailwind CSS 4 的 `@theme` 定义颜色和字体变量。
  - 定义全局字体：
    - 正文字体：`Inter`
    - 标题字体：`Plus Jakarta Sans`
  - 定义项目常用视觉 token：
    - `primary`
    - `surface`
    - `on-surface`
    - `error`
  - 自定义了 `ambient-shadow`、`glass-header` 等通用效果类。

### 8.2 工具函数

- `src/lib/utils.ts`
  - 提供 `cn(...inputs)`。
  - 基于 `clsx + tailwind-merge` 合并 className。

## 9. 构建与配置

### 9.1 `package.json`

关键脚本：

- `npm run dev`：启动 Vite 开发服务器，端口 `3000`
- `npm run build`：构建生产产物
- `npm run preview`：Vite preview
- `npm run lint`：执行 `tsc --noEmit`

关键依赖：

- `react` / `react-dom`
- `react-router-dom`
- `recharts`
- `lucide-react`
- `@ant-design/icons`
- `motion`
- `tailwindcss`

### 9.2 `vite.config.ts`

项目的 Vite 配置包含这些要点：

- 启用 React 插件。
- 启用 Tailwind Vite 插件。
- 启用 `code-inspector-plugin`。
- 将 `@` 映射到仓库根目录。
- 通过 `define` 注入 `process.env.GEMINI_API_KEY`。
- 支持通过 `DISABLE_HMR` 环境变量控制 HMR。

### 9.3 `tsconfig.json`

特征：

- `moduleResolution: "bundler"`
- `jsx: "react-jsx"`
- 允许 `@/*` 路径别名
- `noEmit: true`

## 10. 预览与部署辅助文件

- `index.html`
  - Vite 的 HTML 入口模板。

- `preview-server.cjs`
  - 一个简单的 Node HTTP 服务。
  - 用于直接托管 `dist` 目录，并对 SPA 路由做 `index.html` 回退。
  - 适合构建后本地预览或简易部署场景。

## 11. 当前结构特征与维护建议

### 11.1 当前优点

- 路由层次简单，容易上手。
- 布局层与页面层边界清晰。
- 展示组件拆分较细，复用粒度合适。
- 页面视觉和组件命名整体一致。

### 11.2 当前主要结构问题

- 业务数据分散在多个页面文件和常量文件中，没有统一的数据访问层。
- `InventoryStatusPage.tsx` 体量较大，已经同时承担数据、计算、状态和视图装配职责。
- 类型定义分散在 `src/types` 与 `src/components/pages` 下，边界是“按复用范围划分”，但目前没有明确约束。
- 文案存在明显乱码，说明源码文件可能经历过编码不一致的问题。
- `package.json` 中的 `clean` 脚本使用 `rm -rf dist`，在 Windows 环境下可移植性较弱。

### 11.3 后续演进建议

- 新增 `src/features/` 或 `src/modules/`，按业务域组织大型页面。
- 抽出 `src/services/` 或 `src/api/`，统一处理接口请求。
- 为库存模块拆分：
  - `data.ts`
  - `selectors.ts`
  - `hooks.ts`
  - `components/`
- 将共享类型逐步统一到 `src/types/`，页面私有类型保留在局部模块内。
- 统一文件编码为 UTF-8，优先修复页面文字乱码问题。

## 12. 一句话总结

这是一个结构清晰的 React 中后台原型项目：布局和展示层拆分已经比较合理，但业务数据和页面逻辑仍主要堆在页面文件中，下一步的结构优化重点应该放在“按业务域拆模块”和“补齐数据访问层”。
