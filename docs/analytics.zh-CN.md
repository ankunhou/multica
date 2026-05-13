# 产品分析埋点

本文档是 Multica 发送到 PostHog 的分析事件中文参考。英文原文是 [`analytics.md`](./analytics.md)；事件名、属性名、环境变量名和枚举值保持英文，因为它们是代码与数据仓库里的稳定契约。

这些事件支撑从 acquisition 到 activation 再到 expansion 的漏斗，并最终服务每周活跃工作区（WAW）这个核心指标。

## 配置

分析上报完全由环境变量控制，默认对本地开发和自托管实例关闭：

| 变量 | 含义 | 默认值 |
|---|---|---|
| `POSTHOG_API_KEY` | PostHog 项目 API key；为空时不发送事件。 | `""` |
| `POSTHOG_HOST` | PostHog 地址，可以是 US/EU Cloud 或自托管地址。 | `https://us.i.posthog.com` |
| `ANALYTICS_ENVIRONMENT` | 覆盖事件属性里的 `environment`；会归一化为 `production`、`staging` 或 `dev`。 | 跟随 `APP_ENV`，否则 `dev` |
| `ANALYTICS_DISABLED` | 设为 `true` 或 `1` 时强制使用 no-op client。 | `""` |

自托管实例绝不应该继承 Multica 官方项目的 `POSTHOG_API_KEY`。`.env.example` 默认留空；未设置 key 时，服务端启动会使用 `NoopClient`，并记录一条提示日志，确认不会发出任何事件。运营者如果想使用自己的分析项目，需要显式设置 `POSTHOG_API_KEY` 和 `POSTHOG_HOST`。

## 架构

```text
handler -> analytics.Client.Capture(Event)  // 非阻塞，立即返回
                    |
                    v
          bounded queue (1024 events)
                    |
                    v
    background worker: batch + POST /batch/
                    |
                    v
                 PostHog
```

`analytics.Capture` 不能阻塞请求处理。PostHog 不可用、队列满或网络异常都不能影响产品主流程；队列满时事件会被丢弃，并通过日志和关闭时的 dropped counter 暴露。

批量发送在两种条件下触发：达到 `BatchSize`，或经过 `FlushEvery`（默认 10 秒）。`Close()` 会在优雅关闭时尽量 drain 剩余事件。

## 身份模型

- `distinct_id`：登录态事件始终使用用户 UUID。前端的 `posthog.identify(user.id)` 会把注册前的匿名事件合并到同一身份下。
- `workspace_id`：有工作区上下文的事件都必须带上。v1 通过事件属性过滤计算工作区指标，不依赖 PostHog Groups。
- PII：事件里只带 `email_domain`，不在每条事件里广播完整邮箱。完整邮箱只通过 person property 的 `$set_once` 保存，便于个案排查。
- Person properties：可变画像使用 `$set`，例如 role、use_case、team_size、platform_preference；只应对不会被覆盖的初始值使用 `$set_once`，例如 email、初始 attribution、首次完成时间。

## 事件分类

每个事件都归入一个 dashboard 类别：

| 类别 | 事件 |
|---|---|
| `core_loop` | `workspace_created`, `runtime_registered`, `runtime_ready`, `runtime_failed`, `runtime_offline`, `agent_created`, `issue_created`, `chat_message_sent`, `agent_task_queued`, `agent_task_dispatched`, `agent_task_started`, `agent_task_completed`, `agent_task_failed`, `agent_task_cancelled`, `autopilot_run_started`, `autopilot_run_completed`, `autopilot_run_failed` |
| `onboarding_support` | `onboarding_started`, `onboarding_questionnaire_submitted`, `onboarding_completed`, `onboarding_runtime_path_selected`, `onboarding_runtime_detected`, `starter_content_decided` |
| `acquisition` | `signup`, `download_intent_expressed`, `download_page_viewed`, `download_initiated`, `cloud_waitlist_joined` |
| `ops_feedback` | `feedback_opened`, `feedback_submitted` |
| `system/noise` | `$pageview`, `$set`, `$identify`, `$autocapture`, `$rageclick` |

核心 dashboard 只应使用 `core_loop` 和激活漏斗需要的 `onboarding_support` 步骤。获客、反馈和系统噪声事件放在独立 dashboard。

## 标准核心属性

核心事件在对应实体存在时应携带以下属性：

| 属性 | 类型 | 说明 |
|---|---|---|
| `environment` | string | `production` / `staging` / `dev`，由后端和前端分析 client 写入。 |
| `event_schema_version` | int | 当前版本为 `2`。 |
| `user_id` | string UUID | 已知的人类用户 ID；agent/system 事件可以省略。 |
| `workspace_id` | string UUID | 工作区范围事件必填。 |
| `agent_id` | string UUID | agent/task 事件必填。 |
| `task_id` | string UUID | `agent_task_*` 事件必填。 |
| `issue_id` / `chat_session_id` / `autopilot_run_id` | string UUID | 任务或入口来源实体。 |
| `source` | string | 标准值：`onboarding`, `manual`, `chat`, `autopilot`, `api`。更细的 UI 来源放到 `surface` 或 `trigger_source`。 |
| `runtime_mode` | string | 涉及 runtime/agent task 时为 `cloud` 或 `local`。 |
| `provider` | string | 涉及 runtime/agent task 时为 `claude`、`codex`、`cursor` 等。 |
| `is_demo` | bool | 当前始终为 `false`，预留给演示/测试工作区过滤。 |

终态任务事件额外带 `duration_ms`；失败事件带 `failure_reason`、`error_type` 和 `will_retry`。Runtime 失败事件带 `recoverable`；runtime ready 事件只在实际测量到时携带 `ready_duration_ms`，并在本地 runtime 场景携带 `daemon_id`。

Schema v2 是第一版规范化核心指标 schema。它替代早期 v1 草案中把 `failure_reason` 镜像到 `error_type`、在 task/autopilot failure 上使用 `recoverable`、以及没有真实测量时发送 `ready_duration_ms: 0` 的做法。

## 事件契约

### `signup`

新用户创建时触发，覆盖验证码注册和 Google OAuth。关键属性：

| 属性 | 类型 | 说明 |
|---|---|---|
| `email_domain` | string | 邮箱域名的小写形式。 |
| `signup_source` | string | 前端 cookie `multica_signup_source` 里的 UTM/referrer bundle；缺失时为空。 |
| `auth_method` | string | 可选。Google OAuth 注册时为 `"google"`。 |

通过 `$set_once` 写入 person 的属性包括 `email` 和 `signup_source`。

### `workspace_created`

`CreateWorkspace` 事务成功提交后触发。不要在发送时写 `is_first_workspace`；首次工作区的判断应在 PostHog 里通过用户历史事件或 cohort 计算，避免并发创建时的竞态。

### `runtime_registered`

某个 `(workspace_id, daemon_id, provider)` 元组首次 upsert 时触发。心跳和重复注册不会重复发送。`distinct_id` 优先使用认证用户 ID；daemon-token 注册回退为 `workspace:<workspace_id>`。

### `runtime_ready`

Runtime 首次以在线/ready 状态注册时触发。它才是激活漏斗里比 `runtime_registered` 更可靠的 readiness 信号。普通 daemon 重连只更新原有行，不再次触发。

### `runtime_failed`

Runtime setup/registration 在记录 ready runtime 前失败时触发。当前主要覆盖后端注册持久化失败；未来 provider 探测或 daemon 启动失败也应复用该事件。

### `runtime_offline`

Runtime 被判定离线时触发，用于理解本地 daemon 的可用性。通常由心跳过期或 daemon 状态更新引起。

### `issue_created`

Issue 创建成功后触发。需要包含 `workspace_id`、创建来源、创建者身份以及能用于漏斗分析的任务入口上下文。

### `chat_message_sent`

用户向 agent chat 发送消息时触发。用于衡量 issue 之外的 agent 使用路径。

### `agent_task_queued` / `agent_task_dispatched` / `agent_task_started` / `agent_task_completed`

描述 agent task 从入队、派发、开始执行到成功完成的主路径。事件应携带 `task_id`、`agent_id`、`workspace_id`、入口来源、provider/runtime 信息，以及完成时的 `duration_ms`。

### `agent_task_failed` / `agent_task_cancelled`

任务失败或取消时触发。失败事件必须区分稳定的 `failure_reason` 和便于聚合的 `error_type`，并标出是否会重试（`will_retry`）。

### `autopilot_run_started` / `autopilot_run_completed` / `autopilot_run_failed`

Autopilot run 生命周期事件。需要携带 autopilot/run 标识、触发类型、执行模式和失败原因等信息。

### `issue_executed`

Issue 触发 agent 执行时的业务层事件，用于从用户视角理解“把一个 issue 交给 agent”的转化。

### `team_invite_sent` / `team_invite_accepted`

团队邀请发送和接受事件。用于衡量团队扩张，注意不要在事件属性里携带不必要的完整邮箱。

### `onboarding_started` / `onboarding_questionnaire_submitted` / `onboarding_completed`

Onboarding 漏斗事件。问卷类事件可以写入可变 person properties；首次完成类属性使用 `$set_once`。

### `agent_created`

Agent 创建成功后触发。应包含 workspace、provider、runtime mode、创建来源等信息。

### `cloud_waitlist_joined`

云版本 waitlist 提交时触发，归入 acquisition dashboard。

### `feedback_submitted`

用户提交反馈时触发，归入 `ops_feedback`。

### `starter_content_decided`

Onboarding 或初始化流程决定是否创建 starter content 时触发，用来分析新用户是否接受种子内容。

### 前端专属事件

前端可以发送页面浏览、下载意图、下载发起、反馈面板打开等事件。系统自动采集的 `$pageview`、`$autocapture`、`$rageclick` 应留在 system/noise dashboard，不进入核心漏斗。

## 对账

分析事件不是业务事实来源。产品内的权限、状态、任务结果和审计必须以数据库为准；PostHog 只用于趋势、漏斗和行为分析。发现 dashboard 与数据库不一致时，先检查是否有事件丢弃、schema 版本混用、前后端重复发送或身份合并异常。

## 治理

- 新事件必须先归类到 taxonomy，并明确是否属于核心 dashboard。
- 新属性优先复用标准核心属性；不要为同一含义创建多个名字。
- 不要在高频事件上携带完整邮箱、token、prompt、issue 描述、comment 正文或其它敏感文本。
- 修改事件名或属性名时，按 schema version 演进，避免直接破坏历史 dashboard。
- 自托管默认不发送事件；任何 opt-in 都必须由运营者显式配置自己的 PostHog 项目。
