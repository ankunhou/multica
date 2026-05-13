# 自部署进阶配置

本文是 [SELF_HOSTING.md](SELF_HOSTING.md) 的中文进阶参考。完整变量清单见 [环境变量](apps/docs/content/docs/environment-variables.zh.mdx)。

## 数据库

生产环境建议使用独立 PostgreSQL 17，并启用 pgvector。

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

配置：

```env
DATABASE_URL=postgres://user:password@host:5432/multica?sslmode=require
DATABASE_MAX_CONNS=25
DATABASE_MIN_CONNS=5
```

连接池优先级：环境变量 > `DATABASE_URL` query 参数 > 内置默认值。

## 邮件

登录依赖验证码邮件。生产环境应配置 Resend：

```env
RESEND_API_KEY=...
RESEND_FROM_EMAIL=noreply@example.com
```

未配置时验证码只会打印到 backend stdout。

## 注册控制

```env
ALLOW_SIGNUP=false
ALLOWED_EMAIL_DOMAINS=example.com
ALLOWED_EMAILS=alice@example.com,bob@example.com
```

`ALLOW_SIGNUP=false` 关闭新用户注册。域名和邮箱白名单一旦非空，就会限制可注册范围。

## Google OAuth

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://app.example.com/auth/callback
```

修改后重启 backend 即可，web 不需要重建。

## 文件存储

S3：

```env
S3_BUCKET=my-bucket
S3_REGION=us-west-2
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

S3 兼容服务：

```env
AWS_ENDPOINT_URL=https://r2.example.com
```

本地 fallback：

```env
LOCAL_UPLOAD_DIR=./data/uploads
LOCAL_UPLOAD_BASE_URL=https://app.example.com
```

## CloudFront

```env
CLOUDFRONT_KEY_PAIR_ID=...
CLOUDFRONT_DOMAIN=static.example.com
CLOUDFRONT_PRIVATE_KEY_SECRET=multica/cloudfront-signing-key
```

生产优先用 Secrets Manager 存私钥；`CLOUDFRONT_PRIVATE_KEY` 只建议本地开发兜底。

## Cookie

单主机部署保持：

```env
COOKIE_DOMAIN=
```

只有前后端在同一注册域的不同子域时才设置：

```env
COOKIE_DOMAIN=.example.com
```

不要设置为 IP 地址。

## CORS / WebSocket

```env
FRONTEND_ORIGIN=https://app.example.com
ALLOWED_ORIGINS=https://app.example.com
```

服务端仍兼容旧名：

```env
CORS_ALLOWED_ORIGINS=https://app.example.com
```

## 反向代理

Caddy 单域名部署：

```caddy
multica.example.com {
    @multica_ws path /ws /ws/*
    handle @multica_ws {
        reverse_proxy localhost:8080 {
            flush_interval -1
        }
    }

    reverse_proxy localhost:3000
}
```

`/ws` 路由必须在 catch-all 之前，且 WebSocket 代理需要关闭缓冲。

## 实时指标

反向代理后部署必须设置：

```env
REALTIME_METRICS_TOKEN=...
```

请求时使用：

```text
Authorization: Bearer <token>
```

## Analytics

默认不设置 `POSTHOG_API_KEY` 时，服务端使用 no-op analytics client。

```env
POSTHOG_API_KEY=
POSTHOG_HOST=https://us.i.posthog.com
ANALYTICS_DISABLED=true
```

`ANALYTICS_DISABLED=true` 或 `1` 会强制关闭上报。
