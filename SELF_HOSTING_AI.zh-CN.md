# 自部署 AI 运行指南

Multica 的自部署 server 负责协作数据和调度；AI task 真正在哪里执行，取决于你连接的运行时。

## 本机 daemon

最常见的方式是在开发者自己的机器上运行 daemon：

```bash
multica setup self-host
multica daemon start
```

daemon 会检测本机可用的 agent CLI，例如 `claude`、`codex`、`gemini`、`opencode`、`openclaw`、`hermes`、`kimi`、`kiro-cli`。当 issue 分配给智能体后，daemon 会在本机创建隔离工作目录并执行 task。

## Provider 凭证

Multica 不托管你的模型密钥。本机 CLI 使用它们自己的登录态或环境变量：

- Claude Code 使用 Claude Code 自己的认证
- Codex 使用 Codex / OpenAI 相关配置
- Gemini CLI 使用 Gemini CLI 自己的认证
- 其他 provider 同理

## Agent 环境变量

可以在智能体配置里设置 `custom_env`，这些变量会在 task 执行时注入。

<strong>注意：</strong> `custom_env` 在 Multica 服务端数据库中明文存储。不要放生产数据库密码、root token 或不可轮换的高价值凭证。建议使用最小权限、可轮换的专用 token。

## 自部署建议

- 每个开发者在自己的机器上运行 daemon
- 只把必要 repo 和必要凭证交给 agent
- 给 agent 使用只读或低权限 token
- 定期查看运行时状态，确保 daemon 在线
