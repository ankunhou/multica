# Multica 现代 UI 设计语言与用户体验提升建议

调研日期：2026-05-13

## 结论摘要

Multica 当前的产品形态已经接近现代协作工具的核心骨架：侧边栏导航、看板/列表双视图、命令面板、实时 Agent 状态、shadcn/Base UI 组件、语义化 token、浅/深色主题，以及面向 Web + Desktop 复用的 `packages/views` 架构。下一阶段不应做大面积视觉重做，而应把设计语言收敛成“AI-native 工作台”：高信息密度、低装饰、强状态透明、可预测控制、跨平台一致。

最值得优先投入的方向有五个：

1. 建立 Multica 专属的状态视觉语法，让 Agent、Runtime、Issue、Chat 的状态颜色、动效和文案一致。
2. 强化 Agent 执行过程的可解释性，减少用户对“它现在到底在做什么”的不确定感。
3. 提升高频工作流效率，包括创建 Issue、分配 Agent、查看执行日志、从失败中恢复。
4. 完善信息密度模式，让小团队可以在“扫描”和“细读”之间切换。
5. 做可访问性和触控目标的系统性修正，避免图标按钮、紧凑列表和拖拽交互在移动/粗指针设备上变弱。

## 参考基准

现代 UI 设计语言的共同趋势不是更强的装饰感，而是更强的系统性：

- Material 3 和 Apple HIG 都强调语义化层级、平台一致性、响应式布局和有节制的动效。对 Multica 来说，这意味着保留当前轻量工作台风格，但要减少一次性页面手写样式。
- Atlassian Design System 的基础设计强调一致的间距体系和 design tokens，适合任务管理、协作、项目管理这类高频生产力工具。
- Fluent 2 强调可访问性、包容性、清晰交互反馈，以及跨设备一致体验，适合作为 Web + Desktop 双端体验的参考。
- W3C WCAG 2.2 对焦点可见性、键盘可操作性和目标尺寸提出了更明确要求。Multica 现有很多 `icon-sm` 是 28px，桌面可接受，但移动和粗指针场景需要更大触控目标。
- Microsoft Human-AI Interaction Guidelines 和 Google People + AI Guidebook 都强调 AI 系统必须让用户知道系统能力边界、当前状态、可恢复路径和人工控制点。这与 Multica 的 Agent 协作定位高度相关。

参考链接：

- Material Design 3: https://m3.material.io/
- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- Atlassian Design System foundations: https://atlassian.design/foundations/
- Microsoft Fluent 2: https://fluent2.microsoft.design/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Microsoft Human-AI Interaction Guidelines: https://www.microsoft.com/en-us/research/project/guidelines-for-human-ai-interaction/
- Google People + AI Guidebook: https://pair.withgoogle.com/guidebook/

## 当前产品观察

### 已有优势

- `packages/ui/styles/tokens.css` 已经使用语义 token、OKLCH 色彩、浅/深色主题和品牌色，基础方向正确。
- `packages/views/layout/app-sidebar.tsx` 已经把个人区、工作区、配置区分组，导航结构适合小团队长期使用。
- `packages/views/issues/components/issues-header.tsx` 已经有 scope、filter、display、view toggle，是高频任务管理工具应有的操作面。
- `packages/views/search/search-command.tsx` 已经具备命令面板基础，可扩展为真正的全局操作中心。
- `packages/views/chat/components/chat-window.tsx` 和 `packages/views/issues/components/agent-live-card.tsx` 已经有实时 Agent 任务状态、取消、Transcript 等机制，这是 Multica 区别于普通 Issue Tracker 的核心。
- `packages/views/onboarding/steps/step-welcome.tsx` 已经使用更有品牌感的 onboarding hero，适合首次体验。

### 主要问题

- 视觉 token 有基础，但产品状态语法还不够统一：Issue 状态、Agent presence、Runtime 健康、Task 生命周期、Chat pending 状态各自表达，用户需要反复学习。
- 看板截图和代码中大量小尺寸按钮、徽标、图标按钮混用，扫描效率高，但触控目标和可访问性风险较高。
- Agent 执行过程虽然有 Transcript，但在 Issue 主视图里的“下一步、风险、是否需要用户干预”仍不够前置。
- Onboarding 比主应用更“品牌化”，主应用更“工具化”，两者气质存在落差。进入工作区后，品牌独特性主要退化为蓝色品牌色和图标。
- 页面间密度不稳定：Issue 看板很紧凑，Agent/Runtime/Skill 详情页又有较多大块边框面板，缺少统一密度标准。

## 建议的设计语言方向

### 1. 定位：AI-native ops console

Multica 不应走营销型、插画型、强渐变型 SaaS 风格。它的核心用户是 2-10 人 AI-native 工程团队，目标是反复使用、快速扫描、降低协作不确定性。建议采用：

- 背景：安静、低对比、少装饰。
- 信息：列表、表格、时间线、状态条优先。
- 情绪：可靠、可控、透明，而不是“魔法感”。
- 品牌表达：集中在 Agent 活动、工作区协作、实时状态等差异化场景，而不是到处铺品牌色。

### 2. 视觉原则

- 以状态为第一视觉语言：颜色、图标、动效只服务于状态变化。
- 以密度为默认，而不是以卡片为默认：生产力工具更需要扫读。
- 以用户可控为 AI 交互原则：每个自动执行状态都应有取消、查看日志、重试或转人工路径。
- 以渐进披露减少噪声：默认显示当前决策需要的信息，长日志、配置、历史记录放到可展开区域。

## 优先级建议

### P0：统一状态系统

建议新增一份状态设计规范，覆盖：

- Issue status：backlog、todo、in_progress、in_review、done、blocked、cancelled。
- Agent availability：online、busy、offline、needs setup、archived。
- Runtime health：connected、disconnected、update available、missing provider、limited permissions。
- Task lifecycle：queued、dispatched、running、waiting for user、completed、failed、cancelled。
- Chat state：idle、thinking、tool running、blocked、done。

落地方式：

- 在 `packages/core` 保留业务枚举，在 `packages/views` 或 `packages/ui` 建立只含展示映射的 `status-visuals`。
- 每个状态固定使用：图标、色彩 token、短文案、辅助文案、是否需要脉冲/动画。
- 动效只用于进行中、等待用户、错误恢复，不用于静态装饰。

收益：

- 用户能跨页面理解同一种状态。
- 后续新增 Agent provider、Runtime、Autopilot 时不会继续分裂样式。

### P0：Agent 执行透明度

当前 `AgentLiveCard` 已经回答“是否有人正在工作”，但还需要回答：

- 正在做哪一类动作：读取、编辑、测试、等待、失败恢复。
- 最近一次关键事件是什么：运行测试、提交变更、遇到错误。
- 用户是否需要介入：需要权限、需要澄清、需要重新连接 runtime。

建议：

- 在 Issue 详情页顶部的 live banner 中增加“当前阶段”标签和最近事件摘要。
- Transcript 默认展示为结构化时间线：Plan、Edit、Test、Result、Blocked，而不是仅按原始消息流。
- 失败状态提供明确 CTA：重试、换 Agent、查看日志、创建 follow-up issue。
- 对长任务显示 SLA 式提示，例如“运行超过 20 分钟”，帮助用户判断是否异常。

### P1：信息密度模式

建议为 Issue 和 Agent 列表建立三种密度：

- Comfortable：默认，保留描述、头像、优先级、项目、标签。
- Compact：隐藏描述，缩小纵向间距，突出 identifier、标题、状态、assignee。
- Focus：仅显示当前筛选集合，隐藏边栏或辅助面板，用于处理一组任务。

落地方式：

- 扩展现有 `CARD_PROPERTY_OPTIONS`，从单项属性开关上升为 preset + advanced overrides。
- 在 `useIssueViewStore` 持久化密度设置。
- List view 默认提供更高密度，Board view 保持可视化分组。

### P1：全局命令面板升级为操作中心

当前 SearchCommand 已经能搜索和导航，建议扩展为“导航 + 命令 + 当前上下文动作”：

- 当前 Issue 页面：改变状态、分配 Agent、添加标签、复制链接、打开 Transcript。
- 任意页面：新建 Issue、邀请成员、创建 Agent、连接 Runtime、切换主题。
- 搜索结果中显示类型、状态和最近访问时间，避免同名项目/Issue 混淆。

这能显著减少用户在侧边栏、菜单和详情面板之间移动鼠标的成本。

### P1：首日体验从 onboarding 延伸到工作区

Onboarding 已经比较完整，但用户进入空工作区后仍需要更强的“下一步”引导。建议：

- 空 Issues 页显示 3 个真实操作入口：创建第一个 Issue、连接 Agent、导入 GitHub repo。
- Runtime 未连接时，在 Issues/Agents 页显示轻量 setup banner，不仅在 Settings/Runtimes 中暴露。
- Starter content 创建后，将 Issue 页面上的第一个 Agent 操作做成显式推荐，而不是只给静态示例。

### P2：触控目标与可访问性修正

建议建立组件级约束：

- 桌面紧凑按钮可保持 28-32px，但粗指针/移动环境下图标按钮最小 40px，关键操作不低于 44px。
- 所有图标按钮必须有 tooltip 和 aria-label。
- 拖拽排序必须提供键盘或菜单替代路径。
- focus ring 在浅/深色下都要达到可见性要求。
- 状态不能只靠颜色区分，必须同时有图标或文本。

现有 `Button` 的 `icon-sm` 是 28px，建议通过 media query 或 size variant 在 coarse pointer 下提升目标尺寸。

### P2：品牌表达收敛

建议将品牌表达集中在：

- Agent active / thinking / complete 的微动效。
- Workspace avatar、Agent avatar、Runtime provider logo。
- Onboarding 与空状态中的真实产品插图。
- 数据可视化 chart 系列。

不建议引入大面积渐变背景、装饰光斑、过大圆角或营销式卡片堆叠，这会削弱工作台产品的效率感。

## 可执行路线

### 第 1 阶段：规范收敛

- 写一份 `docs/design/status-system.md`，定义状态视觉矩阵。
- 梳理 `packages/views` 中重复的 status badge、presence indicator、runtime status 映射。
- 将颜色引用尽量收敛到语义 token，避免局部写死色值。

### 第 2 阶段：核心工作流优化

- 改造 Issue 详情顶部的 Agent live banner。
- 将 Transcript 结构化为阶段时间线。
- 扩展命令面板，加入当前上下文动作。
- 为 Issue board/list 增加 density preset。

### 第 3 阶段：跨端体验与可访问性

- 为粗指针设备提升按钮和菜单项 hit area。
- 补齐图标按钮 aria-label。
- 为拖拽操作增加菜单替代路径。
- 做一次浅/深色主题下的状态对比度检查。

## 衡量指标

建议用以下指标判断 UX 改进是否有效：

- 新用户从注册到创建第一个可执行 Agent 的完成率。
- 第一个 Issue 被 Agent 接手的中位耗时。
- Agent 任务失败后用户采取下一步操作的比例。
- 用户打开 Transcript 的频率，以及打开后是否继续 retry/cancel/comment。
- 命令面板使用率和通过命令完成的动作占比。
- 移动/窄屏下关键流程完成率。

## 近期最小可交付

建议下一张实现类 Issue 直接拆成：

1. “统一任务/Agent/Runtime 状态视觉映射”。
2. “Issue 详情页 Agent 执行横幅增加当前阶段与最近事件”。
3. “命令面板增加当前 Issue 上下文动作”。
4. “Issue 视图增加 Compact density preset”。
5. “粗指针设备提升 icon button 命中区域并补齐 aria-label”。

这五项都可以在现有架构内完成，不需要重写设计系统，也不会破坏 Web/Desktop 共享边界。
