# AERONAUT Sites 部署

现有生产地址：https://aeronaut-v1.ycwang1110.chatgpt.site

项目身份由 `.openai/hosting.json` 维护：`appgprj_6ada268b654c8191b201e4eb06f67da7`。这是当前源码对应的既有公开 Sites，V1源码以GitHub提交 `46c89de874359a9b8b9547750e5d02e486ed3ca2` 为基线，首次Sites适配提交为 `31613c04a6324e0835540e7e6c94683beb040315`。Sites有自己的托管源码库；只向GitHub推送不会自动更新它。

## 更新原站

1. 用Sites的get_site确认项目、当前访问权限和编辑身份，保留project_id、网址及public权限。
2. 获取同项目的短时源码写入凭证，并同步其托管源码分支后再编辑。凭证只保存在会话内存，通过隐藏stdin输入；不得提交到仓库或写入文件。
3. 增量修改、类型检查、ESLint、单元测试、生产构建及适当的浏览器和路由检查。
4. 将经验证的准确源码推送至Sites绑定的源码分支。包中包括 `.openai/hosting.json` 和该提交构建的 `out/`，不包含node_modules、凭证或运行时数据。
5. save_site_version保存同一提交及其部署包，再用deploy_site_version部署返回的version_id。仅在返回succeeded及实际网址后称发布成功。
6. 如部署返回pending/building/publishing，继续查询该deployment_id；勿另建项目或更换网址。保留既有版本，失败时修复后续版本，不删除现有站点。

本任务环境有原站owner权限、Sites原生保存/部署工具、Git同步及本地构建能力。Sites辅助脚本未安装，使用相同的源码库凭证完成Git同步和静态包构建，再交由原生Sites工具保存/部署。无需Vercel、域名购买、运行时密钥或额外后端。

## 验证与恢复

本地静态预览支持无扩展名HTML映射。部署后可设置 `TEST_BASE_URL=https://aeronaut-v1.ycwang1110.chatgpt.site` 运行现有路由检查。若环境使用HTTP代理，Node24可加 `NODE_USE_ENV_PROXY=1`。网站保持同源，本地收藏和成绩继续可用，存储格式迁移不删除其他个人数据。

若未来会话缺少Sites工具：将代码和测试结果保留为可审核提交，在能访问该Sites项目的ChatGPT会话中按上述project_id打开原站、同步源码、保存新版本并发布。不要通过create_site建立另一个公开网站，也不要将GitHub或本地构建成功描述为Sites已更新。


## V1.2 保存但不发布

本轮按用户指示只调用 `save_site_version`，禁止在确认前调用部署工具。产物含原 `.openai/hosting.json` 与 `out/`。原公开网址与访问权限不变。环境没有独立Sites预览能力：每个deploy工具产生的网址都是生产地址，不能以部署代替预览。可在具备浏览器预览能力的环境克隆同一源码提交，执行 `npm ci`、`npm run build` 和 `node scripts/preview.mjs`，完成iPad Safari等设备检查。用户确认后，部署交付回执中的同一保存版本，再运行 `TEST_BASE_URL=https://aeronaut-v1.ycwang1110.chatgpt.site npm run test:routes`。
