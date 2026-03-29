# FoodOps 库存管理系统 - 开发文档

## 项目概述

FoodOps 是一个现代化的食品库存管理系统，采用 React + TypeScript + Tailwind CSS 构建，提供实时库存监控、效期预警和数据可视化功能。

## 技术栈

- **前端框架**: React 19
- **开发语言**: TypeScript
- **样式方案**: Tailwind CSS
- **图表库**: Recharts
- **动画库**: Motion (Framer Motion)
- **图标库**: Lucide React
- **构建工具**: Vite
- **包管理**: pnpm

## 项目结构

```
FoOps/
├── public/                          # 静态资源
│   └── vite.svg
├── src/                            # 源代码目录
│   ├── components/                 # React 组件
│   │   ├── actions/               # 操作组件
│   │   │   └── FloatingActionButtons.tsx  # 浮动操作按钮
│   │   ├── charts/                # 图表组件
│   │   │   ├── ChartGrid.tsx      # 图表网格容器
│   │   │   ├── DistributionChart.tsx  # 品类分布图
│   │   │   └── TrendChart.tsx     # 趋势图表
│   │   ├── common/                # 共享组件
│   │   │   ├── LocationBadge.tsx  # 位置徽章
│   │   │   ├── StatusBadge.tsx    # 状态徽章
│   │   │   └── TrendBadge.tsx     # 趋势徽章
│   │   ├── dashboard/             # 仪表板组件
│   │   │   ├── PageHeader.tsx     # 页面头部
│   │   │   ├── StatCard.tsx       # 统计卡片
│   │   │   └── StatCardGrid.tsx   # 统计卡片网格
│   │   ├── layout/                # 布局组件
│   │   │   ├── Header.tsx         # 页面头部
│   │   │   ├── MainLayout.tsx     # 主布局
│   │   │   └── Sidebar.tsx        # 侧边栏
│   │   ├── navigation/            # 导航组件
│   │   │   ├── ProfileWidget.tsx  # 用户资料组件
│   │   │   ├── SidebarItem.tsx    # 侧边栏项
│   │   │   └── SidebarMenu.tsx    # 侧边栏菜单
│   │   └── tables/                # 表格组件
│   │       ├── TableSection.tsx   # 表格区域
│   │       └── UrgentTableRow.tsx # 表格行
│   ├── constants/                 # 常量定义
│   │   └── mockData.ts            # 模拟数据
│   ├── lib/                       # 工具库
│   │   └── utils.ts               # 通用工具函数
│   ├── types/                     # TypeScript 类型定义
│   │   └── inventory.ts           # 库存相关类型
│   ├── App.tsx                    # 主应用组件
│   ├── index.css                  # 全局样式
│   └── main.tsx                   # 应用入口
├── index.html                     # HTML 模板
├── package.json                   # 项目配置
├── pnpm-lock.yaml                 # 依赖锁定文件
├── tsconfig.json                  # TypeScript 配置
├── vite.config.ts                 # Vite 配置
└── README.md                      # 项目说明
```

## 组件架构

### 设计原则

1. **组件化**: 每个UI元素都是独立的React组件
2. **可重用性**: 组件设计为可在不同上下文中复用
3. **类型安全**: 使用TypeScript确保类型安全
4. **关注点分离**: 每个组件只负责一个功能

### 组件层次

```
App (根组件)
├── MainLayout (主布局)
│   ├── Sidebar (侧边栏)
│   │   ├── SidebarMenu (菜单)
│   │   │   └── SidebarItem (菜单项)
│   │   └── ProfileWidget (用户资料)
│   ├── Header (头部)
│   └── main (主内容区)
│       ├── PageHeader (页面标题)
│       ├── StatCardGrid (统计卡片网格)
│       │   └── StatCard (单个统计卡片)
│       │       └── TrendBadge (趋势徽章)
│       ├── ChartGrid (图表网格)
│       │   ├── TrendChart (趋势图表)
│       │   └── DistributionChart (分布图表)
│       ├── TableSection (表格区域)
│       │   └── UrgentTableRow (表格行)
│       │       ├── StatusBadge (状态徽章)
│       │       └── LocationBadge (位置徽章)
│       └── FloatingActionButtons (浮动按钮)
```

## 核心功能

### 1. 实时库存监控

- 显示总库存件数、即将过期商品数量等关键指标
- 提供库存健康指数评估

### 2. 效期预警系统

- 自动检测即将过期（7天内）的商品
- 按紧急程度分类显示（严重/警告/正常）
- 提供处理建议

### 3. 数据可视化

- 库存到期趋势图（柱状图）
- 品类库存分布图（进度条）
- 支持交互式悬停提示

### 4. 响应式设计

- 支持桌面和移动设备
- 使用Tailwind CSS实现一致的视觉设计

## 开发指南

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 代码检查

```bash
pnpm lint
```

## 代码规范

### 文件命名

- 组件文件: PascalCase (e.g., `StatCard.tsx`)
- 工具文件: camelCase (e.g., `utils.ts`)
- 常量文件: camelCase (e.g., `mockData.ts`)

### 组件设计

- 使用函数式组件和Hooks
- 优先使用TypeScript接口定义props
- 保持组件职责单一
- 使用语义化的CSS类名

### 样式指南

- 使用Tailwind CSS工具类
- 遵循Material Design 3设计系统
- 保持一致的间距和颜色方案

## 数据流

当前版本使用模拟数据，未来可扩展为：

1. **API集成**: 替换 `constants/mockData.ts` 为真实API调用
2. **状态管理**: 集成Redux/Zustand进行全局状态管理
3. **实时更新**: 使用WebSocket实现实时数据更新

## 扩展计划

- [ ] 用户认证和权限管理
- [ ] 多仓库支持
- [ ] 高级报表和导出功能
- [ ] 移动端原生应用
- [ ] 物联网设备集成

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。
