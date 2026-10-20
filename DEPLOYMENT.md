# AERONAUT：GitHub + Vercel 部署

准备日期：2026-10-20。部署配置已准备；用户已授权上传 GitHub；Vercel Production 按用户最新要求暂不发布。本文件不将本地构建成功视为已经上线。

当前目标由用户提供：`https://github.com/Ethan-codeer/aeronaut.git`。GitHub 连接现已确认可访问该私有仓库，并具备读写权限，上传前已确认远程为空仓库、默认分支为 main。Vercel 授权仍需完成；Production URL 将以真实部署结果为准。

本地验证已通过：Node 22.23.3 干净检出安装、lint、路由类型生成及严格 TypeScript 检查、13 项测试、生产构建，以及本地生产服务的 24 个路由入口、47 个站内链接/资源和 2 个 404 检查。这些不是公网 HTTPS 或真实设备验证。

## 账号与授权

当前 GitHub 连接识别到的账号为 `Ethan-codeer`，目标仓库为用户提供的 `Ethan-codeer/aeronaut`。

1. 用户已提供目标仓库地址，先完成下方授权并检查该仓库，不要重复创建。如果之后确认仓库确实不存在，再在 https://github.com/new 创建名为 `aeronaut` 的空仓库，建议 Private。不要生成 README、.gitignore 或 License。
2. 在 https://github.com/settings/installations 给 ChatGPT 对此仓库的访问权限。只授权这一个仓库即可。
3. 在 ChatGPT 添加 Vercel，跟随 Vercel 官方页面完成登录授权；若通过网页操作，在 https://vercel.com/login 登录，可选择 GitHub。
4. 目标仓库已确认，用户已授权上传。Vercel 按最新要求暂不发布；后续用户要求发布时，再核对项目归属、已有项目和授权。不会强制推送、删除历史或覆盖已有项目。

不要在聊天、源码、环境变量示例或工单中粘贴密码、GitHub Token、Vercel Token。GitHub 和 Vercel 登录授权都在各自官方页面完成。

## 项目设置

| Vercel 字段           | 值                                              |
| --------------------- | ----------------------------------------------- |
| Framework Preset      | Next.js                                         |
| Root Directory        | `./`                                            |
| Node.js Version       | `22.x`                                          |
| Install Command       | `npm ci`                                        |
| Build Command         | `npm run build`                                 |
| Output Directory      | 使用 Next.js 默认值，不填 `out`                 |
| Environment Variables | 当前无必填变量                                  |
| Production Branch     | 新空仓库使用 `main`；已有仓库以确认后的分支为准 |

`vercel.json` 已声明框架、安装和构建命令；`package.json` 与 `.nvmrc` 声明 Node 22。不要添加将所有路径重写到 `index.html` 的 SPA 规则，不要开启 `output: export`，也不需要提交 `.next` 或 `node_modules`。动态查询、App Router 和 12 个机型详情由 Vercel 的 Next.js 适配器处理。

所有图片位于 `public/images`，不依赖图片 CDN 或运行时抓取。来源与许可保留在 `data/photo-credits.json`、`SOURCES.md` 和 `/credits`。业务数据在 TypeScript/JSON 文件中；用户记录保存在浏览器 localStorage，不写入服务器文件系统。

`TEST_BASE_URL` 只用于 `npm run test:routes` 的检查脚本，不是线上运行必填变量，不应配置成业务密钥。

## 上传源码

当前工作目录的 `.git` 是受限环境目录，不是有效 Git 仓库。不要删除或覆盖它。应使用检查后的源码包在一个独立目录初始化 Git，或在获得仓库写权限和用户确认后，通过 GitHub 连接上传。

如果需要自己上传，在解压后的源码目录中执行：

```bash
git init -b main
git add .
git diff --cached --stat
git commit -m "Initial AERONAUT V1.0 release"
git remote add origin https://github.com/Ethan-codeer/aeronaut.git
git push -u origin main
```

上面的 URL 对应用户提供的目标仓库，但仍需验证访问权限及仓库内容。需要 GitHub 登录时使用 `gh auth login --web`，在官方页面授权；如果已登录则不重复登录。若远程包含文件或历史，先停止并检查，不使用 `--force`。环境目录、凭据、构建输出和本地备份已在 `.gitignore` 和 `.vercelignore` 中排除。

## 首次发布与自动部署

1. 在 https://vercel.com/new 选择 Import Git Repository，连接 GitHub，授权 Vercel 访问 `aeronaut`。
2. 导入已确认的仓库，核对上表设置，确认项目所属账号/团队。
3. 在确认允许公开发布后点击 Deploy。等到 Deployment 状态为 Ready，再记录 Vercel 实际返回的 Production HTTPS 域名；不预先假设 `aeronaut.vercel.app` 可用。
4. 在项目 Settings → Git 核对仓库和 Production Branch。`main` 新提交通常触发 Production，其他分支/PR 触发 Preview；无须另写带部署 Token 的 GitHub Actions。
5. 检查 Production 的 Deployment Protection 设置，确保普通访客无需 Vercel 登录即可访问。保留 Preview 的保护选项，以用户选择为准。

仓库中的 `.github/workflows/ci.yml` 只运行质量检查，使用只读仓库权限，不存储部署密钥。Vercel 原生 Git 集成和 GitHub Actions 是独立检查：默认不是等 Actions 成功后才发布。若需强制质量门槛，可在 GitHub 保护 `main`，要求 PR 合并前通过 `verify`，再通过合并触发 Production。

## 上线后检查

用 Vercel 返回的真实 Production URL 代替下列示例值：

```bash
# macOS / Linux
TEST_BASE_URL=https://YOUR-PRODUCTION-DOMAIN npm run test:routes
```

```powershell
# Windows PowerShell
$env:TEST_BASE_URL = "https://YOUR-PRODUCTION-DOMAIN"
npm run test:routes
```

脚本覆盖首页、百科、机型比较、问答、错题复习、识别挑战、实验室、世界、机库、署名及 12 个详情页；还检查页面链接、图片和 404。公网检查应使用 HTTPS，不跳过证书验证。如果返回 Vercel 登录页，应先核对 Production 域名与访问保护，而不是将其记为测试成功。

## iPad / iPhone / Windows 验收

代码包含响应式断点、coarse-pointer 触控目标、搜索输入字号优化、键盘焦点和 reduced-motion。localStorage 访问有异常处理，备份下载在用户点击时触发，导入通过系统文件选择器完成。这些属于代码审查，不代表已在 Safari 真机运行。

仍需实际设备检查：

- iPad Safari 横竖屏、分屏模式，以及 iPhone 竖屏下导航和表格滚动；Windows Edge/Chrome 页面布局。
- 筛选、主题、收藏、游戏答案与下一题、升力滑块的手指操作。
- 普通模式下收藏后刷新/重开是否保留；隐私模式或系统清理时的提示及回退。
- Safari 下载 JSON 到“文件”应用，以及从“文件”重新导入备份。
- 两台设备之间不自动同步；必须导出/导入。localStorage 按站点域名隔离，从 localhost 或 Preview 换到 Production 前应导出备份。
- 动画、图表首次加载、浏览器控制台、触屏按钮目标和内容是否被裁切。

Safari 可清理网站存储，隐私模式记录也可能在会话结束后消失；重要进度应定期导出。公开发布不会把已有浏览器的本地成绩或收藏上传到 GitHub/Vercel。

## 今后更新与回滚

更新自己的仓库，建议开分支和 PR，检查 GitHub Actions 和 Vercel Preview 后合并到 `main`。在 Vercel Deployments 确认新的 Production 为 Ready，再用正式域名验收。也可在确认风险后直接推送 `main` 触发自动部署。

代码回滚优先用 `git revert` 创建回退提交，保留 Git 历史；紧急情况下可在 Vercel 将已验证的旧部署提升为 Production。固定 Production 域名下，同一浏览器的 localStorage 不随代码部署自动清空；导入逻辑和数据版本升级仍需保持兼容。
