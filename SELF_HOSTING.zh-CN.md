# Multica 自部署指南

本文说明如何在自己的机器或服务器上运行 Multica。更完整的配置清单见 [环境变量文档](apps/docs/content/docs/environment-variables.zh.mdx)。

## 架构

自部署包含三个核心组件：

- 后端：Go HTTP API + WebSocket
- 前端：Next.js web app
- 数据库：PostgreSQL 17 + pgvector

用户本机还需要安装 `multica` CLI，并启动 agent daemon 来执行 AI task。

## 快速开始

```bash
curl -fsSL https://raw.githubusercontent.com/multica-ai/multica/main/scripts/install.sh | bash -s -- --with-server
multica setup self-host
```

完成后打开 http://localhost:3000。

## 手动启动

```bash
git clone https://github.com/multica-ai/multica.git
cd multica
just selfhost
```

`just selfhost` 会创建 `.env`、生成随机 `JWT_SECRET`，并用 Docker Compose 启动后端、前端和数据库。

默认拉取 GHCR 上的稳定镜像。如果要从当前源码构建：

```bash
just selfhost-build
```

## 登录

生产环境推荐配置 Resend：

```env
RESEND_API_KEY=...
RESEND_FROM_EMAIL=noreply@example.com
```

未配置 Resend 时，验证码会打印到 backend 日志，适合本地测试。

固定本地验证码：

```env
APP_ENV=development
MULTICA_DEV_VERIFICATION_CODE=888888
```

公网实例不要设置固定验证码。`APP_ENV=production` 时固定验证码会被忽略。

## 启动 daemon

```bash
brew install multica-ai/tap/multica
multica setup self-host
multica daemon status
```

自有域名：

```bash
multica setup self-host --server-url https://api.example.com --app-url https://app.example.com
```

## 升级

```bash
docker compose -f docker-compose.selfhost.yml pull
docker compose -f docker-compose.selfhost.yml up -d
```

固定版本：

```env
MULTICA_IMAGE_TAG=v0.2.4
```

## 停止

```bash
just selfhost-stop
multica daemon stop
```

## 生产必改配置

至少检查：

- `APP_ENV=production`
- `JWT_SECRET` 使用随机强密钥
- `FRONTEND_ORIGIN` 指向你的实际前端域名
- `RESEND_API_KEY` 已配置，用户能收到验证码
- `COOKIE_DOMAIN` 留空，除非前后端在同一注册域的不同子域
- 公网部署使用 HTTPS 和反向代理
