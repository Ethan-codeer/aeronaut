# AERONAUT V1.1

以简体中文为主的航空探索平台。沿用 V1 的 Next.js App Router、React、TypeScript、Tailwind CSS、Motion、Recharts 与 Lucide，发布于 **ChatGPT Sites**：

https://aeronaut-v1.ycwang1110.chatgpt.site

当前目录 `.openai/hosting.json` 绑定原 Sites 项目 `appgprj_6ada268b654c8191b201e4eb06f67da7`，静态目录为 `out`。不使用 Vercel，不需要数据库、账号、私有 API 或运行时 Node.js 服务器。

## 开发与验证

推荐 Node.js 22.x（至少22.13），使用锁文件安装。此次环境实际以 Node.js 24.19 完成构建。

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```

`npm run build` 生成静态 `out/`，对比页在浏览器读取 `a` 参数，所有飞机与航司详情预生成。静态预览需将 `/atlas` 映射至 `atlas.html`，未知路径返回404；不应把全部未知路径转到首页。运行预览后可执行 `npm run test:routes`，或设置 `TEST_BASE_URL` 检查公开网站。经过 HTTP 代理访问时，Node24可使用 `NODE_USE_ENV_PROXY=1`。

## V1.1 功能

- 保留12个机型档案、搜索筛选、参数对比、30道知识题、升力实验、航空世界、收藏、浏览记录、总成绩、5项成就、主题、动画及导入导出。
- 逐图检查原11张识别照片，新增一张无直接型号标识的授权A350照片。现可玩标准2题、局部2题，全部按家族级识别；专家模式暂不开放。高风险及不确定照片不出题，原飞机百科照片保留。
- 识别图片使用中性路径、通用alt，不在答前显示型号标题、参数或源文件链接；答后显示正确答案、用户选择、外形依据、易混淆机型、百科与图片来源。
- 全球航空公司：`/world/airlines` 及15个详情，名称/代码/国家地区/总部/联盟/成立沿革/历史故事/代表机型/资料日期，搜索和联盟筛选，与机型百科双向关联。
- 航司挑战：`/academy/airlines`，53题（IATA/ICAO30、地理15、完整Logo3、局部Logo3、涂装2），每轮最多10题，题目与选项随机排列。四种模式均可使用；Logo提供完整与局部两档。
- 不保存逐题错误信息。每题反馈、解析、本轮得分、正确率、结果页和总成绩日志继续保留。

## 本地数据兼容

继续使用 `aeronaut-progress-v1` 键，记录格式升级至version2。首次读取V1或导入V1备份时，仅保留收藏、浏览记录、实验状态及合法的总成绩字段，忽略并清除旧逐题列表。仅重写本项目的一个键，不调用localStorage.clear，不触碰其他键；写入被禁用时保留内存进度并提示导出。V2备份不包含逐题错误数据。旧查询参数不再启用复习，打开旧链接会显示普通知识测试。

## 来源与素材审核

具体来源及图片署名见 `/credits`、`data/airlines.json`、`data/spotter.ts`、`docs/v1.1-source-audit.json` 和 `docs/v1.1-image-audit.json`。

航司资料主要来自 IATA、航空公司及联盟官方资料；南航机队有一项使用 Planespotters 二手资料，Qantas 部分官方页面在执行环境返回503、使用官方搜索索引核对，页面已注明。机队关系为带日期的资料快照，不由照片推断。

Logo仅采用Commons明确标为PD-textlogo的ANA、法航及达美图形，商标权保留。照片采用CC BY/CC BY-SA或原项目已核实公有领域素材。未确认授权的12家Logo及9家涂装照片明确待补充，不伪造标志。挑战JPEG副本仅移除可能泄题的描述元数据，不重新编码像素、不修改结构、不做模糊；局部题仅改变显示窗口，保留原作与许可信息。

图片审核是助手逐张视觉检查及许可证核对，不是仅OCR，也不冒充独立人工验收。不确定素材（例如原E195-E2照片）需后续人工审核并暂不出题。新增图片须先完成审核字段、授权、像素可见文字、文件路径、alt与答前元数据检查，再进入可玩题池。

## 当前边界

- 专家识别需更多可可靠判断细微结构的照片。标准与局部题数较少，优先公平而不凑题。
- 12家航司Logo、9家航司涂装实拍尚待授权核实；已有文字档案正常浏览。
- 保留原V1资料缺口：C919巡航马赫数、767-300ER精确首飞日期等，不自行补造。
- 实时航班、登录和跨设备云同步仍未实现。
- 桌面、手机和平板尺寸与触控检查采用Chromium模拟；没有真实iPad/Safari设备验收，也没有WebKit引擎验收。

发布流程见 [DEPLOYMENT.md](DEPLOYMENT.md)，本次变更与验收记录见 [docs/V1.1-DELIVERY.md](docs/V1.1-DELIVERY.md)。
