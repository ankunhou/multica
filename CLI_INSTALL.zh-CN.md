# Multica CLI 安装

本文说明如何安装 `multica` CLI、登录并启动本机 agent daemon。

## 快速安装

### macOS / Linux（Homebrew，推荐）

```bash
brew install multica-ai/tap/multica
multica setup
```

### macOS / Linux（安装脚本）

```bash
curl -fsSL https://raw.githubusercontent.com/multica-ai/multica/main/scripts/install.sh | bash
multica setup
```

### Windows（PowerShell）

```powershell
irm https://raw.githubusercontent.com/multica-ai/multica/main/scripts/install.ps1 | iex
multica setup
```

`multica setup` 会配置 CLI、打开浏览器登录、发现 workspace，并在后台启动 daemon。

## 自部署实例

连接 self-host server：

```bash
multica setup self-host --server-url https://api.example.com --app-url https://app.example.com
```

也可以手动配置：

```bash
multica config set server_url https://api.example.com
multica config set app_url https://app.example.com
multica login
multica daemon start
```

## 验证

```bash
multica daemon status
```

确认状态是 `running`，至少检测到一个 agent CLI，例如 `claude`、`codex`、`gemini`、`opencode`、`openclaw`、`hermes`、`kimi`、`kiro-cli` 或 `pi`。

如果 agent 列表为空，先安装至少一个支持的 AI coding CLI，然后重启 daemon：

```bash
multica daemon stop && multica daemon start
```

## 更新

Homebrew：

```bash
brew upgrade multica-ai/tap/multica
```

安装脚本或手动安装：

```bash
multica update
```

## 无浏览器环境

在 web app 的 **Settings → Personal Access Tokens** 创建 token，然后：

```bash
multica login --token <mul_...>
```

传 `--token=` 空值会进入交互式输入，避免 token 进入 shell history。
