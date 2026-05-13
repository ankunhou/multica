# Codex 沙盒排障：macOS `no such host`

本文解释导致 [MUL-963][mul-963] 的故障模式，以及 daemon 在为每个 Codex 任务写入 `config.toml` 时采用的决策矩阵。

[mul-963]: https://multica-api.copilothub.ai/issues/28c34ad2-102a-4f46-91ac-336ed78c5859

## 症状指纹

| 错误文本 | 可能原因 |
|---|---|
| `dial tcp: lookup HOST: no such host` | **Codex Seatbelt 沙盒阻止 DNS**，发生在 macOS 的 `workspace-write` 模式。 |
| `dial tcp IP:PORT: connect: connection refused` | 对应端口上的 server/daemon 没有运行，属于应用层问题，不是沙盒问题。 |
| `dial tcp IP:PORT: i/o timeout` | 容器级网络策略或防火墙问题，不是 Codex 沙盒问题。 |
| `x509: certificate signed by unknown authority` | TLS/CA 问题，与本沙盒故障无关。 |

如果你在 macOS 的 Codex session 内看到 `no such host`，但同一台机器的普通 shell 可以成功执行 `curl https://multica-api.copilothub.ai`，通常就是下面的 Seatbelt 问题。

## 根因

上游问题：[openai/codex#10390][codex-10390]。在 macOS 上，Codex 对 `sandbox_mode = "workspace-write"` 使用的 Seatbelt profile 会忽略 `[sandbox_workspace_write] network_access = true`。该 Seatbelt policy 硬编码了 `CODEX_SANDBOX_NETWORK_DISABLED=1`，阻止 DNS/UDP syscall；Go 的 `net.LookupHost` 最终表现为 `no such host`。

Linux 的 Landlock 不受影响；问题只发生在 macOS Seatbelt。

[codex-10390]: https://github.com/openai/codex/issues/10390

## Daemon 当前行为

Daemon 会向每个任务的 `$CODEX_HOME/config.toml` 写入一个由 Multica 管理的配置块，使用 `# BEGIN multica-managed` / `# END multica-managed` 标记。标记外的内容保持不变，因此用户仍然可以调整自己的 Codex 配置。

决策矩阵见 [`server/internal/daemon/execenv/codex_sandbox.go`](../server/internal/daemon/execenv/codex_sandbox.go)：

| Host OS | Codex 版本 | 托管配置块写入内容 |
|---|---|---|
| 非 darwin | 任意 | `sandbox_mode = "workspace-write"` + `sandbox_workspace_write.network_access = true`（dotted-key 形式） |
| darwin | 大于等于 `CodexDarwinNetworkAccessFixedVersion` | 同上，表示上游修复已生效。 |
| darwin | 更旧或未知版本 | `sandbox_mode = "danger-full-access"`，并记录 warn 级日志。 |

托管配置块会被提升到 `config.toml` 顶部，并使用 TOML dotted-key 语法，而不是 `[sandbox_workspace_write]` section header。这两点都很重要：如果块位于用户自定义表（例如 `[permissions.multica]`）之后，裸写的 `sandbox_mode = "..."` 会被解析成 `permissions.multica.sandbox_mode`，Codex 会静默忽略它。

`CodexDarwinNetworkAccessFixedVersion` 当前为空，表示尚无已知修复版本。等包含上游修复的 Codex release 发布后，再在 `codex_sandbox.go` 里更新这个值。

当 daemon 回退到 `danger-full-access` 时，会记录 warn 日志，包含原因、Codex 版本、升级提示和写入的配置路径。

## 快速自检命令

在宿主机 shell 中执行，也就是不在 Codex 沙盒内：

```bash
curl -sSf https://multica-api.copilothub.ai/healthz
```

在 Codex session 内执行，也就是 daemon 写入配置之后：

```bash
multica issue list --limit 1 --output json >/dev/null && echo OK
```

如果宿主机 curl 正常，但 Codex session 内的调用报 `no such host`，沙盒就是主要嫌疑。再检查 `$CODEX_HOME/config.toml` 里的托管配置块，确认 daemon 选中了正确策略。

## 方案与取舍

- **A. 域名范围的 `permissions` profile**：等上游 `network_access` 修复可用后，优先写入只允许 `multica-api.copilothub.ai` 和 `multica-static.copilothub.ai` 的 `permissions.multica` profile。这样可以保留文件系统沙盒。
- **B. `danger-full-access`**：当前 macOS fallback。它会放弃整个 Seatbelt profile，是上游修复发布前最简单可靠的绕过方式。
- **C. 升级 Codex CLI**：可以用 `brew upgrade codex` 或 `npm i -g @openai/codex`。等某个 release 包含 [openai/codex#10390][codex-10390] 后，更新 `CodexDarwinNetworkAccessFixedVersion`，macOS 就会自动回到 workspace-write 路径。

## 手动验证托管配置块

```bash
sed -n '/# BEGIN multica-managed/,/# END multica-managed/p' \
  ~/multica_workspaces/$WORKSPACE_ID/$TASK_SHORT/codex-home/config.toml
```

这个配置块是幂等的；重新运行任务会原地重写同一个块。
