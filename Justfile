set windows-shell := ["powershell.exe", "-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command"]

# 显示可用命令。
default:
    just --list

# 显示可用命令。
help:
    just --list

# 初始化当前代码库并启动开发环境。
dev:
    node scripts/just.mjs dev

# 为当前 worktree 生成独立的 .env.worktree。
init-worktree-env:
    node scripts/just.mjs init-worktree-env

# 使用 .env.worktree 初始化当前 worktree 的依赖、数据库和迁移。
setup-worktree:
    node scripts/just.mjs setup-worktree

# 使用 .env.worktree 启动当前 worktree 的后端和前端。
start-worktree:
    node scripts/just.mjs start-worktree

# 停止当前 worktree 的后端和前端进程。
stop-worktree:
    node scripts/just.mjs stop-worktree

# 安装依赖，确保本地数据库存在，并执行迁移。
setup:
    node scripts/just.mjs setup

# 启动 Go 后端和 Next.js Web 应用。
start:
    node scripts/just.mjs start

# 停止当前 checkout 的后端和前端进程。
stop:
    node scripts/just.mjs stop

# 仅启动 Go 后端。
server:
    node scripts/just.mjs server

# 仅启动 Next.js Web 应用。
web:
    node scripts/just.mjs web

# 启动 Electron 桌面端开发环境。
desktop:
    node scripts/just.mjs desktop

# 构建 server、CLI 和 migrate 二进制文件，并写入 git 版本信息。
build:
    node scripts/just.mjs build

# 构建本地 CLI，并重启 local profile 的守护进程。
daemon: build
    node scripts/just.mjs daemon restart --profile local

# 构建本地 CLI，并在前台运行守护进程。
daemon-fg: build
    node scripts/just.mjs daemon start --foreground --profile local

# 停止 local profile 的守护进程。
daemon-stop:
    node scripts/just.mjs cli daemon stop --profile local

# 查看 local profile 的守护进程状态。
daemon-status:
    node scripts/just.mjs cli daemon status --profile local

# 查看 local profile 的守护进程日志。
daemon-logs:
    node scripts/just.mjs cli daemon logs --profile local

# 运行已构建的 multica CLI。示例：just cli version
cli *args:
    node scripts/just.mjs cli {{ args }}

# 配置本地开发用的 multica CLI profile。
cli-setup:
    node scripts/just.mjs cli-setup

# 执行 TypeScript 类型检查。
typecheck:
    node scripts/just.mjs typecheck

# 执行 TypeScript 单元测试。
test-ts:
    node scripts/just.mjs test-ts

# 确保本地数据库存在并完成迁移后，执行 Go 测试。
test-go:
    node scripts/just.mjs test-go

# 执行完整的本地校验流程。
check:
    node scripts/just.mjs check

# 启动共享 PostgreSQL 容器。
db-up:
    node scripts/just.mjs db-up

# 停止共享 PostgreSQL 容器。
db-down:
    node scripts/just.mjs db-down

# 重置当前本地数据库并重新执行迁移。
db-reset:
    node scripts/just.mjs db-reset

# 执行数据库迁移。
migrate-up:
    node scripts/just.mjs migrate-up

# 回滚数据库迁移。
migrate-down:
    node scripts/just.mjs migrate-down

# 重新生成 sqlc 代码。
sqlc:
    node scripts/just.mjs sqlc

# 删除生成的 server 二进制文件和临时文件。
clean:
    node scripts/just.mjs clean

# 使用官方镜像启动自托管 Docker Compose 服务。
selfhost:
    node scripts/just.mjs selfhost

# 从当前源码构建镜像并启动自托管 Docker Compose 服务。
selfhost-build:
    node scripts/just.mjs selfhost-build

# 停止自托管 Docker Compose 服务。
selfhost-stop:
    node scripts/just.mjs selfhost-stop
