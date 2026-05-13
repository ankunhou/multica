# 贡献指南

Multica 使用 `just` 作为本地命令入口。跨平台流程逻辑放在 `scripts/just.mjs`，再通过 `Justfile` 暴露。

## 首次设置

```bash
just setup
```

这个命令会安装依赖、按需启动共享本地 PostgreSQL 容器、创建当前配置的本地数据库，并执行迁移。

## 本地开发

启动后端和 Web：

```bash
just start
```

开发 desktop 时建议开三个终端：

```bash
just start
```

```bash
just build
just cli-setup
just daemon
```

```bash
just desktop
```

常用单项命令：

```bash
just server
just web
just desktop
just daemon-status
just daemon-logs
```

## 并行 Worktree 开发

如果需要同时开发多个分支，可以为当前 Git worktree 生成独立的本地开发环境：

```bash
just init-worktree-env
just setup-worktree
just start-worktree
```

这个流程会写入 `.env.worktree`，根据当前 worktree 路径生成独立的本地数据库名、后端端口和前端端口。停止当前 worktree 的应用进程用 `just stop-worktree`。

## 校验

执行完整本地校验：

```bash
just check
```

单项校验：

```bash
just typecheck
just test-ts
just test-go
just sqlc
```

## 数据库

```bash
just db-up
just db-down
just migrate-up
just migrate-down
just db-reset
```

`just db-reset` 会拒绝对远程数据库运行。

## 自托管

使用官方镜像：

```bash
just selfhost
```

从当前源码构建镜像：

```bash
just selfhost-build
```

停止自托管服务：

```bash
just selfhost-stop
```

## 命令维护规则

- `Justfile` 保持薄而清晰。
- 跨平台行为放在 `scripts/just.mjs`。
- 新增流程逻辑优先使用 Node 原生代码，避免依赖特定 shell。
- 新文档里的命令要和 `just --list` 保持一致。
