# AERONAUT Codex Cloud UI/UX Skills

2026-10-24。仅配置仓库技能；不修改应用 UI、不构建新站、不保存或部署 Sites 版本。

## 架构与既有技能

GitHub Ethan-codeer/aeronaut，检查时 HEAD 3d0df940dfd3d6252763113d4af693b09d542c15，与远端 main 一致。Next.js 16 App Router 静态导出、React 19、TypeScript、Tailwind 4 和 globals.css；Lucide、motion、Three.js、Leaflet、Recharts；Vitest 和静态路由检查。Node package engines 为22.x，本次环境为24.x；安装技能不改运行依赖。托管仍为原 ChatGPT Sites。

安装前仓库没有 SKILL.md；AGENTS.md 仅有 Next.js 自动生成的版本提醒。原 .gitignore 忽略整个 /.agents/，现仅开放 skills 子目录供版本控制，其他代理本地设置继续忽略。没有写入个人技能目录或安装插件。

## 候选实查与选择

来源以 docs/design-skills-lock.json 中完整 commit SHA 固定，避免把日后上游变化当成本次审查结果。

| 候选 | 实际内容与许可 | 结论 |
| --- | --- | --- |
| anthropics/skills: skills/frontend-design/SKILL.md | Apache-2.0；许可来自该目录的 LICENSE.txt，非推断仓库统一许可。视觉方向、字体、层级、品牌语境、自评与实现建议；纯 Markdown 无脚本 | 安装为 frontend-design，原文与许可证原样保留 |
| nextlevelbuilder/ui-ux-pro-max-skill: .claude/skills/ui-ux-pro-max/SKILL.md | 根目录 MIT，保留 Copyright (c) 2024 Next Level Builder；含本地 CSV、引用指南及 Python 标准库检索工具 | 安装 ui-ux-pro-max，保留整套数据及脚本，修改 Claude 专用命令路径，补项目约束说明 |
| pbakaus/impeccable: .agents/skills/impeccable/SKILL.md | Apache-2.0；当前4.7.1版本要求运行 context launcher，可首次下载执行二进制，另有 hooks、pin、doctor、项目上下文/设计文件管理；本次只读代码，没有执行 launcher | 不安装。其 Read/Operate/Experience 分工有参考价值，但与本次轻量离线配置相比执行面更大，且与已选技能重叠。这不是认定其恶意 |
| aeronaut-design-system | 本项目原创规则，无外部执行依赖 | 安装，固定 AERONAUT Hybrid 方向与产品约束 |

实际检查了三个候选的 SKILL.md、声明许可、选中脚本的导入/文件操作与相对数据路径，以及 Impeccable launcher 的下载/执行路径。锁文件记录77个安装文件的 SHA-256，便于维护中识别漂移；不代表无漏洞认证。

## 兼容性与风险处置

- frontend-design 对大胆视觉选择、非默认字体及内容创作的建议不能覆盖 AERONAUT 的既定品牌、真实航空资料、素材许可和本次范围。仅在已授权 UI 任务中使用。
- ui-ux-pro-max 原入口含 CLAUDE_PLUGIN_ROOT/.claude 路径，已改为仓库 .agents/skills 下的命令；从其他 cwd 调用时应先解析绝对 skill 路径。脚本定位同目录 data，不需 pip/npm 包或联网。保留本地参考、数据来源与字体许可元数据；并未安装字体、图标包或动画库。
- Python 搜索不带 --persist 时仅输出建议；--persist/--force/--output-dir 有写入或覆盖设计文档能力，普通查询不用这些选项。数据建议含平台差异，不能将 iOS pt、Android dp、WCAG CSS px 混用，也不能把搜索结果当成合规认证。
- 不运行上游 CLI 安装器、不启用 hooks、不自动执行第三方二进制、不添加 GSAP 等建议依赖。所有建议受用户任务与平台权限约束。
- 上游许可允许复制修改分发，但字体及引用外部媒体/商标另行核实；许可文件不自动授权外部资产。
- 五大主导航作为 V1.3.1 目标写入本地专属 Skill。当前六项导航保留不动，未来将词典移至持久工具入口时必须保留全部词典 URL 和可发现性。

## 验证结果与边界

- `python3 scripts/check-design-skills.py`：三个目录、frontmatter、许可和77个文件哈希检查通过。
- Python 本地 search.py 查询返回真实结果；validate_data.py 验证12个 domain、22个 stack 和 reasoning 数据通过。
- 当前 Codex Cloud 执行器通过原生 Codex app-server 的 `skills/list`、forceReload=true，传入本仓库 cwd，发现三个 repo scope 技能且 enabled=true；随后逐个读取实际 SKILL.md 成功。机器证据见 design-skills-cloud-check.json。
- 初次启动 CLI 遇运行状态目录只读；使用正常工具附加文件写权限，仅用于 CLI 运行状态初始化，技能仍安装在仓库。未绕过平台权限，也未创建模型对话或调用外部服务验证设计效果。
- `scripts/check-design-skills-cloud.py` 可重做原生发现检查，需要本机 Codex CLI 可用及其正常运行状态写权限。当前聊天的初始技能目录不会保证热更新；后续新 Cloud 任务在正确仓库 cwd 重新发现。不能将当前机器验证等同于所有未来镜像、账户或 Safari UI 验收。
- 本次没有应用代码变更，因此未重跑应用构建或 UI 回归测试；技能读取/数据查询验证不能替代未来 V1.3.1 UI 实测。

## V1.3.1 调用方法

在仓库根目录启动 Codex Cloud 新任务，示例提示词：

> 请使用 $aeronaut-design-system、$frontend-design 和 $ui-ux-pro-max，按 AERONAUT Hybrid 规范实施 V1.3.1 的飞机百科页面 UI/UX 改造。先读取目标组件及既有样式，保留业务、稳定 ID、素材署名和 Sites 部署配置。验证 iPad 横竖屏与手机布局；本轮仅提交，不发布。

可按需只点名项目规范与一个辅助 Skill；后端任务不用加载。若 UI 列表暂未刷新，直接要求读取 `.agents/skills/aeronaut-design-system/SKILL.md` 等文件，而不是声称技能自动加载成功。

离线查询示例（仓库根目录）：

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "touch target keyboard" --domain ux -n 2
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "responsive navigation" --stack nextjs -n 2
python3 scripts/check-design-skills.py
```

技能升级必须重新检查上游 SKILL.md、许可、脚本行为和相对路径，更新锁文件及云端发现证据；不要盲目覆盖本项目规范。真实 UI 开发按修改范围另做 typecheck、测试、build 和可用的浏览器检查，真实 Safari 尚需实机验收。
