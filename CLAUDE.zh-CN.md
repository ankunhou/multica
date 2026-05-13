# CLAUDE.md 中文参考

> 英文版 [CLAUDE.md](CLAUDE.md) 是本仓库 agent 工作的权威指令源。本文件提供中文参考，方便人工阅读；如有不一致，以英文原文为准。

## 约定来源

代码命名、i18n 术语表、中文文案风格的单一事实来源在 docs：

- 英文：[apps/docs/content/docs/developers/conventions.mdx](apps/docs/content/docs/developers/conventions.mdx)
- 中文：[apps/docs/content/docs/developers/conventions.zh.mdx](apps/docs/content/docs/developers/conventions.zh.mdx)

写翻译、命名新路由/包/文件/DB 字段、写中文产品文案前，都先查这两页。

## 项目背景

Multica 是一个 AI-native task management 平台，类似 Linear，但把 AI 智能体作为一等公民。

- 智能体可以被分配 issue、创建 issue、评论、改变状态
- 支持本地 daemon runtime 和云端 agent runtime
- 面向 2-10 人 AI-native 团队

## 架构

- `server/`：Go 后端
- `apps/web/`：Next.js web app
- `apps/desktop/`：Electron desktop app
- `packages/core/`：跨平台 headless 逻辑
- `packages/ui/`：纯 UI 组件
- `packages/views/`：共享业务页面 / 组件

共享包直接导出 `.ts` / `.tsx` 源文件，由消费 app 的 bundler 编译。

## 状态管理规则

- TanStack Query 管理服务端状态
- Zustand 管理客户端状态
- Workspace-scoped query 必须把 `wsId` 放进 query key
- mutation 默认做 optimistic update
- WebSocket 事件只 invalidate query，不直接写 store
- 不要把 API 数据复制到 Zustand

## 常用命令

```bash
make dev
make setup
make start
make stop
pnpm dev:web
pnpm dev:desktop
pnpm build
pnpm typecheck
pnpm lint
pnpm test
make test
make sqlc
make migrate-up
make migrate-down
```

## 包边界

- `packages/core/`：不能依赖 react-dom、localStorage、process.env、Next.js、UI 库
- `packages/ui/`：不能依赖 `@multica/core` 或业务逻辑
- `packages/views/`：不能依赖 `next/*`、`react-router-dom`、store；路由走 `NavigationAdapter`
- `apps/web/platform/`：唯一允许 Next.js API 的位置
- `apps/desktop/.../platform/`：唯一允许 react-router-dom navigation wiring 的位置

## API 响应兼容

桌面 app 是安装到用户机器上的，可能长期落后于服务端版本。消费 API 响应时：

- parse，不要 cast
- 使用 `parseWithFallback`
- downstream optional-chain 和默认值兜底
- enum drift 要降级展示，不要崩溃
- 新增或修改 endpoint 时同步添加 schema 和 malformed response 测试

## 后端 UUID 解析

- 用户边界输入用 `parseUUIDOrBadRequest`
- 已经由 DB / sqlc round-trip 的可信 UUID 用 `parseUUID`
- 接受 UUID 或人类可读 ID 的 path param 走专用 loader
- 不要把未经验证的 URL param 直接喂给写查询

## 前端开发规则

新增页面：

1. 页面组件放 `packages/views/<domain>/`
2. web 和 desktop 都接路由（desktop 的 pre-workspace overlay 例外）
3. 导航使用 `useNavigation().push()` 或 `AppLink`
4. 共享 guard/provider 使用 `packages/views/layout/`
5. 平台特定 UI 留在 app platform 层

## CSS

- 使用 semantic token，例如 `bg-background`、`text-muted-foreground`
- 不要硬编码 Tailwind 色值
- 共享样式放 `packages/ui/styles/`
- Tailwind v4 用 `@theme`，不要改旧 `tailwind.config`

## 测试

- `packages/core/`：Vitest，Node environment
- `packages/views/`：Vitest，jsdom + Testing Library
- `apps/web/`：Vitest，jsdom，Next.js mock
- E2E：Playwright

## 安全

- 不要把 secret 打到日志、analytics 或错误消息里
- `custom_env` 明文存储，不能放高价值 secret
- OAuth/JWT/cookie 改动要检查浏览器安全属性

完整细节以英文 [CLAUDE.md](CLAUDE.md) 为准。
