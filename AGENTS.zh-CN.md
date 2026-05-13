# 仓库指南（中文参考）

> 英文版 [AGENTS.md](AGENTS.md) 是 agent 读取的权威指令源。本文件是中文参考译本。

## 单一事实来源

本文件只做简短指引。所有权威的架构、编码规则、命令和约定都在项目根目录的 [CLAUDE.md](CLAUDE.md)。开始修改代码前先读它。

## 快速参考

### 架构

Go 后端 + monorepo 前端（pnpm workspaces + Turborepo）+ 共享包。

- `server/`：Go 后端（Chi router、sqlc、gorilla/websocket）
- `apps/web/`：Next.js 前端（App Router）
- `apps/desktop/`：Electron 桌面 app
- `packages/core/`：headless 业务逻辑（Zustand stores、React Query hooks、API client）
- `packages/ui/`：原子 UI 组件（shadcn/Base UI，无业务逻辑）
- `packages/views/`：共享业务页面和组件
- `packages/tsconfig/`：共享 TypeScript 配置

### 状态管理

- React Query 管理所有服务端状态：issue、member、agent、inbox、workspace list
- Zustand 管理客户端状态：当前 workspace、视图过滤器、草稿、modal
- 所有 Zustand store 都在 `packages/core/`，不要放在 `packages/views/` 或 app 目录
- WebSocket 事件只做 React Query invalidation，不直接写 store

### 包边界

- `packages/core/`：不能依赖 react-dom、localStorage、process.env
- `packages/ui/`：不能 import `@multica/core`
- `packages/views/`：不能 import `next/*`、`react-router-dom`；路由走 `NavigationAdapter`
- `apps/web/platform/`：唯一允许使用 Next.js API 的位置

### 常用命令

```bash
just dev
pnpm typecheck
pnpm test
just test-go
just check
```

完整命令参考见 [CLAUDE.md](CLAUDE.md)。

### 任务收尾

- 每次任务完成后，都要为已完成的变更创建 git 提交。
- 提交信息必须使用中文，包含清晰摘要和详细变更说明，并符合常见行业规范。
