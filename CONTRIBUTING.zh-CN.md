# 参与贡献

本文是 Multica 代码库贡献者的本地开发指南。更详细的中文 docs 版本见 [开发者贡献指南](apps/docs/content/docs/developers/contributing.zh.mdx)。

## 开发模型

本地开发使用一个共享 PostgreSQL 容器，每个 checkout 使用独立数据库。

- 主 checkout 通常使用 `.env` 和 `POSTGRES_DB=multica`
- 每个 Git worktree 使用自己的 `.env.worktree`
- 所有 checkout 连接同一个 PostgreSQL：`localhost:5432`
- 隔离发生在数据库层
- 后端和前端端口会为每个 worktree 生成不同值

## 前置要求

- Node.js 20+
- pnpm 10.28+
- Go 1.26+
- Docker

## 首次设置

主 checkout：

```bash
cp .env.example .env
make setup-main
make start-main
```

Worktree：

```bash
make worktree-env
make setup-worktree
make start-worktree
```

## 日常命令

```bash
make start
make stop
make check
```

前端：

```bash
pnpm install
pnpm dev:web
pnpm dev:desktop
pnpm typecheck
pnpm lint
pnpm test
```

后端：

```bash
make build
make test
make sqlc
make migrate-up
make migrate-down
```

## 数据库排查

查看当前 checkout 使用的 env：

```bash
cat .env
cat .env.worktree
```

列出本地数据库：

```bash
docker compose exec -T postgres psql -U multica -d postgres \
  -At -c "select datname from pg_database order by datname;"
```

只重置当前 checkout 数据库：

```bash
make stop
make db-reset
make start
```

`make db-reset` 会拒绝对远程数据库运行。
