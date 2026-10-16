# Qwerty Français — TCF Canada

只保留法语内容的 [Qwerty Learner](https://github.com/RealKai42/qwerty-learner) fork，用打字练习、学习计划和模考备考 TCF Canada。

线上地址：<https://french.paytonpei.top>

## 功能

### 词汇打字与词库
- 68 个法语词库，共 6,402 个学习项，分为基础 A1-A2、A1/A2/B1/B2 精编、语法专项、B1 实用提升、B2 冲刺、TCF 专项。
- 支持法语重音字符输入和单词朗读（优先使用 Lingua Libre 真人录音）；保留章节练习、默写、速度与正确率统计。
- `/dictionary` 词典页，`/word-lists` 自定义词表。

### 学习计划
- `/study-plan`：26 周路线图，按约 7 小时/周安排每天任务；可设考试日期、每天目标分钟、每周学习日，支持「10 分钟最低模式」。
- 智能今日任务：按 SM-2 到期量、错题分布和每日目标生成复习/词汇/语法/变位配比，不改变路线图布局。
- 可选专注计时器、浏览器通知提醒、PWA 离线启动。

### 定级与等级课程
- `/placement-test`：约 20 分钟、24 题（词汇/语法/阅读），映射 CEFR A1–B2+ 并估算 NCLC 区间（训练用）。
- `/levels`、`/echelle`：按魁北克量表（Échelle québécoise）12 个等级学习；通过后按 1→2→4→7→15→30→60→120 天间隔复习，`/levels/review` 列出到期复习。
- 写作/口语知识点可接 AI 评分（见下文）。

### 语法、变位与时态
- `/grammar-session`：30 分钟语法训练（Passé composé vs imparfait），每题先写理由再看解释。
- `/conjugation`：30 个核心动词，Présent / Passé composé / Imparfait 查看与打字练习。
- `/tenses`：时态讲解与变位速查。

### 错题本、统计与周报
- `/error-book`：词汇、语法、变位错误统一错题本，连续答对 3 次视为掌握。
- `/analysis`：学习分钟热力图、正确率趋势、掌握度、预计完成日期、TCF 成绩趋势与 NCLC 7 目标线。
- 打卡、成就、按计划周生成的周报；支持 JSON/CSV 导出和删除全部学习数据。

### TCF Canada 模考
- `/tcf` 总入口。
- 听力 CO（`/tcf-listening`）：39 题 / 35 分钟；阅读 CE（`/tcf-reading`）：39 题 / 60 分钟。
- 写作 EE（`/tcf-writing`）与口语 EO（`/tcf-speaking`）：3 个任务，计时、字数统计、录音与自评。
- NCLC 7 目标：CO 458、CE 453、EE/EO 10/20。所有分数为训练估算，不替代官方成绩。

### 手机点按模式
- `/tap`：无需键盘的闪卡和四选一练习。

### 账号与同步
- Google（Firebase）或 Apple 登录，也可用 Passkey；匿名模式下用 HttpOnly Cookie 区分浏览器。
- 同一 learner 的数据存服务端（SQLite 或 D1），可用 256-bit 同步码跨设备绑定；离线操作进入本地队列，联网后自动同步。

### 机经与管理页
- `/recalls`：学员提交 TCF 口语/写作考题回忆（机经），审核后入库。
- 管理页（不在主导航）：`/admin/placement`（定级看板与多班级）、`/admin/recalls`（机经审核）、`/admin/users`，需要 `STUDY_ADMIN_TOKEN`。

## 本地开发

需要 Node.js 24（后端使用内置 SQLite）和 Yarn。

```bash
yarn
yarn server   # 后端，127.0.0.1:8787，自动读取 .env.local
yarn start    # 前端，http://localhost:5173
```

Vite 会把 `/api` 代理到后端。数据库默认在 `data/study-plan.sqlite`。
`npm run preview:study` 可一条命令启动本地 Workers + D1 + 前端，无需云账号。

## 配置

服务端变量写在被 git 忽略的 `.env.local`（不要加 `VITE_` 前缀）；前端构建变量才用 `VITE_`。参考 `.env.example`。

| 变量 | 说明 |
| --- | --- |
| `STUDY_ORIGIN` | 允许的页面来源，需精确匹配（默认 `http://localhost:5173`） |
| `STUDY_COOKIE_SECURE` / `STUDY_COOKIE_SAME_SITE` | 公网 HTTPS 部署设为 `true`；跨站 API 用 `none` |
| `STUDY_DB_PATH` | SQLite 路径 |
| `STUDY_ACCESS_PASSWORD` | 公开部署时限制陌生人调用接口 |
| `STUDY_AUTH_REQUIRED` / `STUDY_ALLOWED_EMAILS` / `STUDY_MAX_NEW_ACCOUNTS_PER_DAY` | 登录要求与注册限制 |
| `STUDY_FIREBASE_PROJECT_ID` | Google（Firebase）登录校验 |
| `STUDY_APPLE_CLIENT_ID` / `STUDY_APPLE_REDIRECT_URI` | Apple 登录 |
| `STUDY_ADMIN_TOKEN` | 管理页令牌（≥16 字符） |
| `STUDY_RECALL_MODERATOR_TOKEN` / `STUDY_RECALL_MODERATOR_CAN_APPROVE` | 机经审核令牌；默认只拒不批 |
| `STUDY_METRICS_TOKEN` | `/api/metrics` 的 bearer token |
| `STUDY_TRUST_PROXY_IP` | 是否信任代理传来的客户端 IP |
| `VITE_STUDY_API_BASE_URL` | 前后端分开托管时的 API 地址，同源部署留空 |
| `VITE_FIREBASE_*` | 前端 Firebase 配置 |

### AI 评分变量

| 变量 | 说明 |
| --- | --- |
| `STUDY_AI_PROVIDER` | `openai`（任何 OpenAI 兼容接口：OpenAI、DeepSeek、通义千问、OpenRouter、Ollama…）/ `anthropic` / `mock`（离线启发式，仅开发和 E2E 用）。不设置即关闭 AI 评分 |
| `STUDY_AI_MODEL` | 模型名（`mock` 以外必填） |
| `STUDY_AI_API_KEY` | API key（Worker 用 `wrangler secret put STUDY_AI_API_KEY`） |
| `STUDY_AI_BASE_URL` | OpenAI 兼容接口地址，默认 `https://api.openai.com/v1` |
| `STUDY_AI_JSON_MODE` | `on`（默认）/ `off`：不支持 `response_format` 的接口设为 `off` |
| `STUDY_AI_TIMEOUT_MS` | 单次请求超时，默认 45000 |
| `STUDY_AI_DAILY_LIMIT` | 全站每 24 小时最多 AI 评分次数，默认 300（另有每学员 30 次/小时、每 IP 60 次/小时） |

## 部署

GitHub Pages 只能托管前端，学习计划后端需要以下任一方式。详见 [部署说明](deploy/README.md)。

- **Cloudflare Workers + D1**：在 `deploy/.env` 填好 `CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_API_TOKEN` 后运行 `npm run deploy:free`。
- **Docker Compose（Node + SQLite + Nginx）**：
  ```bash
  export BUILD_COMMIT_SHA=$(git rev-parse --short HEAD)
  docker compose up --build -d   # http://localhost:8990
  ```
  生产叠加 `docker-compose.production.yaml`（Caddy HTTPS）。VPS 更新用 `scripts/deploy-vps.sh`。
  不要运行 `docker compose down -v`，会删除数据卷；备份请用 SQLite backup API 或 `npm run test:backup-drill` 验证过的流程。

## 测试

| 命令 | 内容 |
| --- | --- |
| `yarn test:backend` | 后端 API 与同步单元测试 |
| `yarn test:e2e` | 主站 Playwright e2e |
| `yarn test:e2e:study` | 学习计划 e2e（Node SQLite + Vite + Chromium） |
| `yarn test:cloud` | Workers + D1 持久化测试 |
| `yarn test:backup-drill` | SQLite 在线备份与恢复演练 |
| `yarn typecheck` / `yarn lint` | 类型检查 / ESLint |
| `yarn check:bundle` | 首屏与 chunk 体积预算 |

## AI 评分 harness

`server/echelle-ai-harness.mjs`：评分标准取自量表官方描述，4 个维度各 0–4 分；是否通过由我方规则判定（平均 ≥ 2.75、任务完成 ≥ 3、每项 ≥ 2）。输出严格 JSON 校验，引用必须来自原文，答案用随机 nonce 标签隔离以防注入；结果由服务端写入，客户端无法伪造。

换模型前先校准，一致率低于 85%（`STUDY_AI_MIN_AGREEMENT`）或把弱样本判为通过会以非 0 退出：

```bash
STUDY_AI_PROVIDER=… STUDY_AI_MODEL=… STUDY_AI_API_KEY=… node scripts/ai-calibrate.mjs
```

## 机经审核 harness

`server/recall-moderation-harness.mjs` + `scripts/recall-moderator.mjs` 审核学员提交的机经：

- 默认 `--dry-run`，只输出决策；`--apply` 才会改动。
- 自动通过默认关闭（`--auto-approve` 或 `RECALL_AUTO_APPROVE=1` 开启）；关闭时合格项只标为 `hold` 并推荐通过，由管理员在后台批准。
- 确定性前置过滤（链接、联系方式、注入语句等）先于模型；模型不调用工具、不接触令牌；存疑一律转人工。
- 单次上限 50 条、自动通过上限 20 条；令牌和密钥不写日志。

```bash
# 校准
STUDY_AI_PROVIDER=mock STUDY_AI_MODEL=mock-1 node scripts/recall-moderator.mjs --calibrate
# 预演
RECALL_API_BASE=http://127.0.0.1:8787 RECALL_API_TOKEN=your-token STUDY_AI_PROVIDER=mock node scripts/recall-moderator.mjs --dry-run
# 纯规则模式
RECALL_API_BASE=http://127.0.0.1:8787 RECALL_API_TOKEN=your-token node scripts/recall-moderator.mjs --rules-only --no-excerpt --apply --log logs/moderation.jsonl
```

完整安全模型、残留风险和全部命令见 [docs/recall-moderation.md](docs/recall-moderation.md)。

## 致谢与许可

- 基于 [RealKai42/qwerty-learner](https://github.com/RealKai42/qwerty-learner) 修改。
- 词典释义部分由 [kaikki.org](https://kaikki.org) / Wiktextract 提取裁剪，按 CC BY-SA 4.0 使用；「本站词库」释义为本项目自行整理。
- 单词发音使用 Lingua Libre / Wikimedia Commons 真人录音（CC BY-SA）。
- 代码以 GPL-3.0 发布，见 [LICENSE](LICENSE)。
