# Multica 现代 UI 与用户体验改进计划

## 背景

Multica 是面向 2-10 人 AI-native 团队的任务管理平台。它的核心差异不是"又一个 issue tracker"，而是把智能体作为一等成员：智能体可以接收议题、执行 task、评论、更新状态，并和成员共同推进工作。

因此，Multica 的现代 UI 语言不应追求营销式视觉冲击，而应服务于高频协作、实时判断和 AI 可控性。

推荐设计方向：

> 像 IDE 一样高效，像 Linear 一样克制，像 AI cockpit 一样实时。

## 设计原则

### 1. Calm Operations

主界面应保持安静、高密度、可扫读。导航、表格、看板、详情页都应优先表达信息层级，而不是装饰性视觉。

- 少用大面积渐变、玻璃拟态、插画背景。
- 保持低噪声表面：`background`、`muted`、`card`、`border` 作为主要层级。
- 仅在用户需要判断风险或下一步动作时增强视觉权重。

### 2. Expressive Agent State

智能体状态是 Multica 的产品核心，应比普通成员头像、普通状态点更具表达力。

状态表达应回答三个问题：

- 智能体现在能不能工作？
- 它正在做什么？
- 用户是否需要介入？

### 3. Contextual by Default

搜索、命令、创建议题、Chat 输入、智能体动作都应理解当前上下文。

例如用户在某个议题详情页时，命令面板应优先提供：

- 总结当前议题
- 让智能体处理当前议题
- 复制议题链接
- 拆分为子议题
- 分配给智能体

### 4. Failure Is a Workflow

智能体失败、创建失败、运行时离线、权限不足都不应只是 toast 或静态错误文案。失败状态应提供恢复路径：

- 重试
- 编辑后重试
- 转为手动创建
- 分配给其他智能体
- 查看执行日志
- 归档此通知

### 5. Dense but Adjustable

Multica 的目标用户会长时间停留在工作台中。界面应默认高效，但允许用户调整密度。

建议提供三档密度：

- Compact：高密度 triage，适合列表和收件箱。
- Comfortable：默认协作密度。
- Focus：详情页、评审和阅读场景。

## 当前基础

代码中已经存在较好的 UX 基础：

- 语义 token 集中在 `packages/ui/styles/tokens.css`。
- 侧边栏已有工作区、个人、配置、Pin、未读、运行时更新入口。
- Issues 已支持 scope、filter、display、board/list 切换。
- Chat 已支持 pending task、乐观反馈、Context Anchor、智能体切换。
- Inbox 与 Issue Detail 已使用 resizable split pane。
- 智能体列表已有 availability、workload、activity sparkline。

这意味着下一阶段不是重做视觉，而是统一状态语言、提升上下文动作、强化 AI 可控性。

## 优先级路线图

### P0：统一智能体状态语言

目标：让用户在任何界面都能一致理解智能体是否可用、是否正在执行、是否需要处理。

建议新增共享展示组件：

- `AgentStateBadge`
- `AgentWorkloadBadge`
- `AgentTaskStatePill`

状态模型建议：

| 状态 | 用户含义 | 表现 |
| --- | --- | --- |
| online idle | 可用，当前空闲 | 绿点 + 低调文字 |
| running | 正在执行 | spinner 或轻微 pulse + 运行数 |
| queued | 等待执行 | 时钟 + 队列数 |
| blocked | 需要用户介入 | warning 色 + 明确动作 |
| failed | 执行失败 | destructive 色 + 恢复操作 |
| completed | 刚刚完成 | success 色，短暂出现 |

落地范围：

- 智能体列表
- 智能体详情页
- Chat 会话下拉
- 议题详情中的智能体执行卡片
- 收件箱中的智能体相关通知

验收标准：

- 同一状态在不同页面颜色、图标、文案一致。
- 仅用颜色无法传达完整含义，必须配合文本或 aria label。
- `queued` 在线时保持低调，离线或长期等待时升级为 warning。

### P1：升级命令面板为 Command Center

目标：让用户通过 `Cmd/Ctrl+K` 完成主要工作，而不是寻找按钮。

建议新增命令：

- 让智能体处理当前议题
- 总结当前议题
- 拆分当前议题为子议题
- 分配给智能体...
- 打开执行中的 task
- 打开失败的 task
- 切换到 Compact / Comfortable / Focus
- 只看智能体负责的议题
- 只看需要我评审的议题

验收标准：

- 无上下文时显示通用命令。
- 在议题详情页显示议题相关命令。
- 在项目详情页显示项目相关命令。
- 所有命令都可通过键盘完成。

### P1：把 Inbox 变成处理队列

目标：从通知流升级为"需要我处理"的工作队列。

建议分组：

- 需要确认
- 智能体失败
- 提到我
- 评论回复
- 已完成待归档
- 系统通知

每个分组都应有明确批量动作：

- 全部标为已读
- 全部归档
- 仅归档已完成
- 重试所有可重试失败项

验收标准：

- 用户进入 Inbox 后，能一眼看出哪些项目需要动作。
- 归档后自动选择下一项，保持 triage 节奏。
- 移动端保持 list/detail 单页切换，不引入复杂多栏。

### P1：AI 结果解释与恢复

目标：让用户相信并控制智能体行为。

建议为智能体关键动作提供轻量解释面板：

- 使用了哪些上下文
- 做了哪些修改
- 哪些字段由智能体推断
- 有哪些不确定项
- 可执行动作：接受、撤销、编辑、重试、查看日志

优先场景：

- quick create 失败
- 智能体创建议题
- 智能体修改议题状态
- 智能体生成子议题
- 智能体执行失败

验收标准：

- 失败不是终点，用户总有下一步。
- 智能体自动修改的结果可追溯。
- 重要修改有撤销或手动修正路径。

### P2：视图密度与预设

目标：让用户根据工作模式切换信息密度。

建议预设：

- Default：常规协作视图。
- Agent work：突出智能体负责人、执行状态、失败与阻塞。
- Review：突出 `in_review`、评论、PR、最近更新。
- Compact：高密度列表，适合 daily triage。

技术约束：

- 状态放在 `packages/core` 的 Zustand store。
- UI 只消费 store，不在 `packages/views` 新增 store。
- Web 和 Desktop 共用同一套预设。

验收标准：

- 预设切换不改变服务器数据。
- 工作区切换时不会泄漏旧工作区筛选状态。
- 视图设置可被持久化，但临时选择状态不持久化。

### P2：桌面级空间管理

目标：让 Desktop 体验更接近 IDE。

建议增强：

- Split pane hover 态更清晰。
- 提供"重置布局"命令。
- Chat 窗口 expanded / floating 状态更可发现。
- Detail sidebar 可折叠状态跨页面保持一致。
- 拖拽动作提供菜单或键盘替代路径。

验收标准：

- 无鼠标用户也能完成关键操作。
- resize handle 在 hover/focus 时可感知。
- 布局异常时用户能恢复默认布局。

## Design Token 建议

现有 token 已有 `brand`、`success`、`warning`、`info`。建议增加更贴近产品语义的 token，而不是在组件里硬编码状态色。

建议新增：

- `--agent-running`
- `--agent-running-foreground`
- `--agent-queued`
- `--agent-queued-foreground`
- `--agent-blocked`
- `--agent-blocked-foreground`
- `--agent-failed`
- `--agent-failed-foreground`
- `--agent-completed`
- `--agent-completed-foreground`
- `--surface-subtle`
- `--surface-raised`
- `--surface-selected`

使用原则：

- 业务状态优先用语义 token。
- 不在 `packages/views` 中新增硬编码 Tailwind 色值。
- 深色模式必须单独校准，而不是简单复用浅色 token。

## 可访问性要求

重点覆盖以下场景：

- 看板拖拽必须有菜单替代操作。
- Pin 排序必须有键盘或菜单替代操作。
- Split pane handle 必须可聚焦或有重置命令。
- 仅图标按钮必须有 tooltip 和 aria label。
- 状态不能只靠颜色表达。
- 移动端可点击目标不应过小。
- 动效遵守 `prefers-reduced-motion`。

## 建议 PR 拆分

### PR 1：统一智能体状态展示

- 新增共享状态展示组件。
- 替换智能体列表、详情页、Chat 会话入口中的重复状态 UI。
- 补充单元测试，覆盖 online / offline / running / queued / failed。

### PR 2：命令面板上下文动作

- 为 SearchCommand 增加上下文命令分组。
- 在议题详情页启用议题相关命令。
- 补充键盘选择测试。

### PR 3：Inbox 分组

- 增加按动作类型分组的展示层。
- 保留现有 deduplicate 逻辑。
- 批量动作按分组生效。

### PR 4：AI 失败恢复流

- quick create failed 通知增加编辑后重试路径。
- 失败项展示原始输入、智能体、错误原因和恢复动作。
- 避免只用 toast 表达失败。

### PR 5：视图密度预设

- 扩展 issue view store。
- 增加预设切换 UI。
- Board card、List row、Inbox item 读取统一密度。

## 文案原则

中文 UI 文案遵守 `apps/docs/content/docs/developers/conventions.zh.mdx`。

推荐写法：

- "智能体正在执行"
- "等待运行时接收"
- "需要你确认"
- "无法创建议题"
- "编辑后重试"
- "查看执行日志"

避免写法：

- "AI 发生错误"
- "Oops"
- "智能任务失败了！"
- "Agent failed"
- "Unknown error"

## 外部调研参考

- Google Material 3 Expressive：强调快速扫读、更自然的动效和更具表达力的状态。
- Microsoft Human-AI Interaction Guidelines：强调 AI 系统需要说明能力、状态、边界，并支持用户纠正。
- Apple Human Interface Guidelines：适合 Desktop 的侧边栏、分栏、工具栏和平台一致性。
- WCAG 2.2：关注焦点可见性、拖拽替代、目标尺寸、减少运动等基础可访问性要求。

## 一句话总结

Multica 的体验升级重点不是"更漂亮"，而是让用户在 AI 与人共同工作的环境里，更快判断状态、更容易发出指令、更安心地纠正结果。
