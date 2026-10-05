# Qwerty Français — TCF Canada

一个只保留法语内容的 Qwerty Learner fork，用打字练习记忆 TCF Canada 高频词汇与表达。

## 当前内容

目前共 **1,276 个学习项**，按学习阶段组织：

- **基础 A1-A2**：基础核心词、人物与日常作息、基础形容词与副词、日常生活主题
- **语法专项**：Passé composé 高频句块、Passé composé vs imparfait 对比句
- **B1 实用提升**：工作/学习/行政、B1 连接词、动词与固定介词、公共服务与社会生活
- **B2 冲刺**：观点表达、抽象名词、高频搭配
- **TCF 专项**：口语/写作核心表达、口语任务 2 高频提问、正式邮件与论证

## 26 周学习计划

新增独立 `/study-plan` 页面：按约 7 小时/周安排周一到周日任务，自动显示当前 Week / 26 与六个月阶段；支持“今天太累了 → 10 分钟最低模式”，并通过服务端保存每个任务的实际学习分钟数和本周累计时长（浏览器保留离线待同步队列）。

## 30 分钟语法训练

新增独立 `/grammar-session` 页面。第一套为 **Passé composé vs imparfait**：30 分钟倒计时、4+4+2 分组、每题必须先写“为什么”才能提交、提交后才显示标准解释，最后用 3 个法语句子做输出。进行中的答案与完成记录都会进入学习后端，浏览器本地仅保留兼容缓存与离线队列。

## 动词变位

新增独立 `Conjugaison` 页面，首批包含 30 个核心动词，支持 Présent、Passé composé、Imparfait 三种时态的查看与随机打字练习；正确/总次数会原子累计到学习后端，并保留本地兼容缓存。

## 特点

- 只展示法语词库，不保留原版英语、日语、德语等词库。
- 默认语言与默认词库均为法语 / TCF Canada。
- Gallery 按 A1-A2 → 语法专项 → B1 → B2 → TCF 专项分区。
- 支持法语重音字符输入。
- 支持法语单词朗读。
- 保留章节练习、错题复习、默写、速度与正确率统计等原版核心功能。
- 已移除原版 CET4 首章硬编码、原站统计、捐赠弹窗和社区推广入口。

## 本地运行

```bash
yarn
yarn start
```

默认开发地址为 `http://localhost:5173/`。

## 部署

仓库包含 GitHub Pages workflow，推送到 `master` 后可构建并发布到 `gh-pages`。

公网学习计划推荐使用 **Cloudflare Workers Free + D1**：前端与 API 同源、HTTPS、安全 Cookie，数据在重新部署后保留。完整注册步骤、环境变量、`npm run deploy:free` 一键部署，以及 Node SQLite + Nginx 的生产 Compose 路径见 [部署 README](deploy/README.md)。GitHub Pages 静态发布本身不能运行学习计划后端。

## Upstream

本项目基于 [RealKai42/qwerty-learner](https://github.com/RealKai42/qwerty-learner) 修改。原项目许可证见本仓库 `LICENSE`，衍生版本继续遵守相应开源许可。


## 学习计划服务端持久化

学习计划现在使用同源 `/api/study-plan` API + SQLite / Workers D1 保存考试日期/26 周排期、每天目标分钟、每周学习日、每天的实际任务分钟数、最低模式，以及词汇历史、语法进度/历史和动词变位统计。`/api/study-plan/analytics` 从同一份服务端状态聚合周/总分钟、阶段完成度、连续学习天数和三类练习统计。
任务完成状态仍按原有规则由「实际分钟数 ≥ 任务目标」计算；取消完成会把分钟数存为 0。
词汇练习完成章节后的分钟数也写入服务端。路线图、词库、语法训练和变位练习内容不变。

### 开发

需要 Node.js 24（后端使用内置 SQLite，无额外 npm 依赖）。两个终端分别运行：

```bash
yarn server
# 另一个终端
yarn start
```

Vite 自动把 `/api` 代理到 `127.0.0.1:8787`，默认允许的页面来源是 `http://localhost:5173`。
后端数据库默认位于 `data/study-plan.sqlite`，重启后保留。运行 `yarn test:backend` 验证 API 与客户端同步。

### 部署

```bash
docker compose up --build -d
```

访问 `http://localhost:8990`。Nginx 提供前端并转发 API，SQLite 放在 `study-data` 持久卷中。
公网部署时在 HTTPS 反向代理后运行，设置 `STUDY_ORIGIN=https://你的域名` 和
`STUDY_COOKIE_SECURE=true`，然后重新启动 compose。来源必须精确匹配（包括端口）。
备份数据库时使用 SQLite backup API，或停止后端后备份整个数据卷；不要只复制运行中的主数据库而漏掉 WAL。
不要执行 `docker compose down -v`，该命令会删除数据卷。

GitHub Pages 只能托管静态文件，无法运行这个后端。仅部署到 Pages 时，记录会留在本地待同步，
页面显示服务端不可用；必须运行上述后端和同源代理，才有服务端保存能力。

### 身份、迁移和重试

- 第一次访问 API 会生成随机浏览器身份，通过 HttpOnly / SameSite Cookie 隔离数据；请求不能指定其他用户 ID。
- 默认仍用随机 HttpOnly Cookie 隔离浏览器身份；在学习计划顶部可生成 256-bit 同步码，新设备粘贴后会绑定到同一 learner。服务端只保存同步码哈希；同步码本身等同账号密码，请只保存在自己的设备上。
- 初次升级会把旧 IndexedDB 词汇历史（最多 3000 条）、旧语法历史和旧变位累计迁入后端；已有服务端记录优先，迁移操作带幂等/去重保护且不会删除本地原记录。
- 修改按字段提交；词汇分钟数与练习事件用幂等 ID，重试不会重复累计。计划设置、开始日、最低模式、手动分钟数与语法草稿使用客户端更新时间做 LWW（最新时间戳优先），因此离线多设备恢复后不会用旧值覆盖新值。
- 待提交操作先写入本地队列，刷新不会丢失；断网或接口失败后自动重试，状态显示在现有消息位置。
- 学习计划开始日期决定当前周/阶段，因此刷新后进度、完成标记和分钟数一起恢复。
- 词汇、语法、变位与学习计划现在共享同一 learner 状态；换设备通过同步码恢复后，错词筛选、语法未完成草稿、变位正确率和学习统计都会从服务端读取。
- 练习页面使用同一 durable mutation queue：词汇章节结束、语法训练完成、变位练习离开时会主动 flush；断网时先留在本机，浏览器重新联网、聚焦或恢复可见后自动重放并按时间戳合并。
- 后端根据单词、语法题和变位错误历史生成“今日复习”队列；复习按钮使用简化 SM-2（ease / repetition / interval / due date），结果同样跨设备同步。
- 同步码支持查看绑定状态、解绑当前设备（保留独立副本）以及从原设备撤销同步码；被撤销的码无法再绑定新设备。
- “数据分析”页面完全读取服务端 analytics/review API：可按天/周/月查看学习分钟、单词/语法/变位正确率趋势，并显示错误最多的单词、语法点和动词排行。

### 远程 API 与无需凭据的预览

`npm run preview:study` 一条命令启动本地 Workers + 持久 D1 + 学习计划页面，无需托管账号。
默认前端仍请求同源 `/api/study-plan`；分开托管时，在构建前设置 `VITE_STUDY_API_BASE_URL=https://你的Worker域名`。
服务端配置精确 `STUDY_ORIGIN`，跨站 HTTPS 模式使用 `STUDY_COOKIE_SECURE=true`、`STUDY_COOKIE_SAME_SITE=none`；前端自动携带 Cookie。
`/health` 与 `/api/health` 验证数据库表结构就绪，数据库异常返回 503。
浏览器拦截第三方 Cookie 时请用同源部署；当前为匿名会话，刷新可恢复，但不等同于跨设备账号。
完整环境变量、免费部署及剩余账号授权步骤见 [部署说明](deploy/README.md#separate-frontend--remote-worker-api)。


## 学习计划设置、提醒与 PWA

- 学习计划顶部可以设置 **考试日期、每天目标分钟、每周学习日**。考试日期会反推完整 26 周的开始日；每天目标只缩放计划任务目标，历史实际分钟和已经完成的词汇/语法/变位记录不会被改写或删除。
- “每天目标分钟”留空时保持原路线每天不同的任务时长；设置数值后，会按当天原任务比例分配到各任务。未选中的星期仍保留路线图位置，但作为计划休息日。
- 浏览器通知提醒是显式 opt-in，并支持自定义提醒时间。提醒偏好只保存在当前浏览器；考试日期/每日目标/学习日会随 learner 后端状态跨设备同步。
- 已注册 PWA Service Worker。应用壳和已经加载的静态资源会缓存供离线启动，`/api/*` 永远不进入 Service Worker 缓存；断网练习继续走原有 durable mutation queue，联网后自动同步。
- 浏览器平台无法保证在网页/PWA **完全关闭** 后仅靠本地 JavaScript 准时唤醒，因此本地提醒在浏览器或 PWA 运行/恢复时检查并通知。
- `npm run test:e2e:study` 使用本地 Node SQLite API + Vite + Chromium，覆盖真实变位练习、断网保存、PWA 离线 reload、恢复网络自动同步、同步码第二设备绑定以及服务端统计页。
