# CLI 与 Daemon

`multica` CLI 负责登录、workspace 管理、issue 操作，以及启动本机 agent daemon。daemon 是本地运行时：它检测 AI CLI、注册运行时，并在智能体被分配 task 时执行工作。

完整命令参考见 [CLI 参考](apps/docs/content/docs/cli/reference.zh.mdx)。

## 登录

```bash
multica login
multica auth status
multica auth logout
```

无浏览器环境可使用 PAT：

```bash
multica login --token <mul_...>
```

传 `--token=` 空值会进入交互式输入，避免 token 进入 shell history。

## 启动 daemon

```bash
multica daemon start
multica daemon status
multica daemon logs -f
multica daemon stop
```

默认后台运行，日志在 `~/.multica/daemon.log`。

## 配置 self-host

```bash
multica config set app_url https://app.example.com
multica config set server_url wss://api.example.com/ws
multica login
multica daemon start
```

或一键：

```bash
multica setup self-host --server-url https://api.example.com --app-url https://app.example.com
```

## Workspace

```bash
multica workspace list
multica workspace get <workspace-id>
multica workspace members <workspace-id>
```

daemon 会自动跟踪你所属的 workspace。使用 `multica config set workspace_id <workspace-id>` 设置 CLI 命令默认工作区。

## Issue

```bash
multica issue list
multica issue get MUL-123
multica issue create --title "Fix login bug"
multica issue assign MUL-123 --to "Agent Name"
multica issue status MUL-123 in_progress
multica issue comment add MUL-123 --content "看起来没问题"
```

状态值：`backlog`、`todo`、`in_progress`、`in_review`、`done`、`blocked`、`cancelled`。

## Daemon 配置

常用环境变量：

- `MULTICA_SERVER_URL`
- `MULTICA_APP_URL`
- `MULTICA_DAEMON_POLL_INTERVAL`
- `MULTICA_DAEMON_HEARTBEAT_INTERVAL`
- `MULTICA_DAEMON_MAX_CONCURRENT_TASKS`
- `MULTICA_AGENT_TIMEOUT`
- `MULTICA_WORKSPACES_ROOT`

Agent CLI 覆盖项：

- `MULTICA_CLAUDE_PATH` / `MULTICA_CLAUDE_MODEL`
- `MULTICA_CODEX_PATH` / `MULTICA_CODEX_MODEL`
- `MULTICA_OPENCODE_PATH` / `MULTICA_OPENCODE_MODEL`
- `MULTICA_OPENCLAW_PATH` / `MULTICA_OPENCLAW_MODEL`
- `MULTICA_HERMES_PATH` / `MULTICA_HERMES_MODEL`
- `MULTICA_GEMINI_PATH` / `MULTICA_GEMINI_MODEL`
- `MULTICA_CURSOR_PATH` / `MULTICA_CURSOR_MODEL`
- `MULTICA_KIMI_PATH` / `MULTICA_KIMI_MODEL`
- `MULTICA_KIRO_PATH` / `MULTICA_KIRO_MODEL`
