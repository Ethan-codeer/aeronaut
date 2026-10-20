# AERONAUT V1.0

The World of Flight, at Your Fingertips.

以简体中文为主的航空探索平台，使用 Next.js App Router、React、TypeScript、Tailwind CSS 4、Motion、Recharts 和 Lucide。代码位于当前目录，不依赖数据库、账号或私有 API。

## 本地启动

使用 Node.js 22.x（至少 22.13）和 npm，与 Vercel 配置保持一致。

```bash
npm ci
npm run dev
```

访问 http://localhost:3000 。生产启动：

```bash
npm run build
npm start
```

本项目使用 Webpack 构建模式，避免部分容器环境中 Turbopack CSS 编译器的子进程端口限制。npm 锁文件固定了验证过的依赖版本。

## 已完成功能

- 首页、统一响应式导航/页脚、深浅主题、独立页面元信息、404 与错误恢复页。
- 12 个准确区分子型号的机型档案，搜索、制造商/类别筛选、参数来源、识别特征、相关机型。
- 任选两机型对比，交换机型、参数差值、指标选择、Recharts 柱图、详情跳转。
- 30 道结构化航空知识题（入门/进阶/专家各 10 题），即时反馈、解析、来源、正确率、错题复习。
- 11 道机型识别题，对应真实授权照片；照片失效时仍显示外形线索并允许作答。
- 交互升力实验、速度曲线、气流概念动画、公式和模型边界说明。
- localStorage 收藏、浏览记录、测验结果、错题、5 项自动成就；JSON 导出、校验导入与覆盖确认。
- 存储被禁用/容量不足时保留内存进度并提示导出，支持同源浏览器标签页存储同步。
- 机场知识、航空历史、未来航班地图介绍，不提供模拟实时航班。
- 11 架真实机型的本地授权照片、12 个原创 SVG 示意图、完整图片来源和许可证清单。
- 键盘焦点样式、跳过导航、图片替代文本、reduced-motion、手机/iPad/桌面断点。

## 主要目录

```text
app/                    页面与路由、全局设计系统
components/             交互、图表与公共界面
data/aircraft.ts        类型明确的飞机数据库及参数来源
data/questions.ts       问答与识别题库
data/photo-credits.json  原始图片、作者、许可与源页面
lib/                    升力/计分逻辑、备份格式和本地存储
public/images/          本地照片与原创 SVG
scripts/check-routes.mjs 生产路由与站内链接检查
tests/                 核心逻辑、题库和本地存储测试
```

## 检查

```bash
npm run lint
npm run typecheck
npm test
npm run build
# 在另一个终端运行 npm start 后：
npm run test:routes
```

自动检查覆盖升力单位/缩放/非法输入、计分、题库完整性、图片题型号对应、备份格式及存储异常。路由检查访问所有主路由与 12 个详情，检查页面引用的站内资源/链接并验证 404。

本次环境未提供可连接浏览器，因此没有声称完成真实 Windows/iPad/手机上的视觉验收、浏览器控制台或交互端到端测试；发布前建议补充这些检查。

## 内容来源及缺口

详细清单见 [SOURCES.md](SOURCES.md) 和网站 `/credits`。飞机资料来自 Airbus、Boeing、Embraer、COMAC 的公开型号资料及机场规划手册；升力来自 NASA Glenn；机场资料参考 FAA/IATA。数值是公开参考构型，不代表每架飞机或实际航班能力。

- C919 巡航马赫数、767-300ER 首飞日期尚待确认，明确标为“待核实”。
- A321XLR 缺少本次已核实授权和子型号的照片，使用原创示意图，不加入识别题。
- 部分来源是系列入口，尚无逐参数 PDF 修订版/页码快照。典型巡航马赫数为近似值；航程和参考座位随构型变化，应在专业应用前重新审校。
- A350-900 航程不混用 ULR；747-8 参数对应客运型；C919 航程标明增程构型。

## 部署

GitHub 仓库授权、Vercel 设置、自动部署和设备验收步骤见 [DEPLOYMENT.md](DEPLOYMENT.md)。

### Vercel

将当前目录推送至自己的 Git 仓库，在 Vercel 导入，框架选 Next.js，构建命令 `npm run build`。无需环境变量。保持 Node.js 22+。本次交付未向外部托管平台发布。

### Node.js 服务器

在服务器运行 `npm ci && npm run build && npm start`，用反向代理提供 HTTPS，服务端口默认为 3000，可用 `PORT` 修改。

如果需要 standalone 制品，可在 `next.config.ts` 中添加 `output: "standalone"`，并按 Next.js 的 standalone 部署说明复制静态资源；此时使用生成的 `server.js` 启动。默认配置使用标准 `npm start`。

localStorage 按浏览器及站点源隔离；更换域名或设备前，在机库导出备份并在新站导入。当前不支持静态导出，因为对比和错题复习页读取 URL 查询参数。

## 尚未实现 / V2

实时航班地图和追踪后端、注册登录、跨设备云同步未实现，均非 V1 必需项。V2 建议：参数编辑审校与资料版本管理、更多有授权的多视角照片、按标签组织的自适应题库、完善的浏览器 E2E/无障碍测试，以及接入获得授权且明确标注延迟的航班 API。
