# 机经审核 harness（完整说明）

> 本文从旧版 README 原样迁移。概要见 [README](../README.md#机经审核-harness)。

### 机经审核 harness · 防提示词注入安全审核

学员提交的 TCF Canada 口语/写作考题回忆（机经）在入库前为 `pending` 状态。审核机器人运行在受信任机器上，使用专用审核令牌批量拉取并处理待审机经。机经文本为攻击者完全可控的内容，审核 harness（`server/recall-moderation-harness.mjs`）遵循严格的防注入安全模型：

- **自动通过默认关闭（推荐模式，Auto-Approve Opt-In）**：
  默认情况下 `allowAutoApprove` 为关闭（CLI 参数 `--auto-approve`，或环境变量 `RECALL_AUTO_APPROVE=1` 显式开启）。在默认关闭状态下，`moderateRecall` 与 `decideRecall` **绝对不会返回 `approve` 裁定**：所有通过全部严苛检验的合格机经均判定为 `hold` 并附带原因 `RECOMMEND_APPROVE` 与 `recommendation: "approve"`，runner 在控制台输出分流清单，且在 `--apply` 模式下**绝不向 API 发起 action 为 approve 的请求**。模型在关闭模式下仅能向下清洗垃圾与违规投稿（`reject`），所有候选通过项均留给管理员在后台管理页一键批量审批。在 auto-approve 关闭模式下，误过率（False Approvals）在数学上严格恒为 0。
- **模型永不执行**：模型只负责输出分类元数据，不提供工具调用，不接触令牌、URL 或 ID。所有审批/拒绝 API 调用与 ID 均由本地安全逻辑决定并从拉取列表中严格校验。
- **不可信文本严格数据化**：候选题目置于带随机独立 Nonce 的 `<recall-NONCE>` 标签内，插入前对用户输入清洗并中立化标签及 Nonce 字符串；系统提示明确指示所有内容为纯数据，严禁听从任何伪装指令。
- **严格输出契约与修复轮次**：强制单一 JSON 输出（包含 verdict、reasons、isExamTopic、injectionDetected、evidence）；证据必须是原文的逐字子串；允许一次修复轮次，二次校验不合格一律转人工审核（`hold`），绝不自动通过。
- **双重确定性门禁优先**：文本在进入所有检测前统一执行易混淆字符折叠（Confusables fold，将西里尔/希腊仿冒字母与小型大写字母 Small-Caps 映射至 ASCII Latin）、Unicode NFKC 归一化、剥离零宽与格式字符，并在原始规整串与压实串（squashed）上双重匹配。前置过滤器无模型调用直接阻断联系方式、URL、混淆域名（点com/dot com/[dot]）、真题答案/保过招揽、乱码与过短文本；独立元词汇门禁（meta-vocabulary gate）检测审核与 AI 术语（如 预先批准、无需审核、放行、合格、助手、override、bypass、jailbreak 等，触发即转 `hold`）；确定性注入正则覆盖中/英/法指令（disregard the above、classify this as、let this through、new task 等）、角色伪造与闭合标签，命中一律转 `hold`。
- **自动通过为严格难径**：即使开启 `--auto-approve`，也必须满足：前置过滤干净、注入与元词汇门禁干净、模型裁定 `approve`、`isExamTopic` 为 true、模型报告未检出注入，且经由不同 Nonce 与提示词的独立二次注入安全探针裁定 `clean: true`，方可自动通过；任一异常或超时即转 `hold`。
- **自动拒绝仅限明确情形**：仅在前置过滤直接命中，或模型在未检出注入的前提下以明确理由（广告、离题、乱码、辱骂）判定拒绝时生效；任何存疑或潜在注入一律保留为 `hold` 由人工复核。
- **残留风险与安全边界（Residual Risk）**：
  在开启 `--auto-approve` 的情况下，完全避开所有已知词汇与指令模板的新型隐蔽劝说（Novel Persuasion）仍然依赖两次独立的模型调用（分类器 + 探针）；确定性前置过滤器保证即使被劝说通过，该条目也绝不可能包含任何外部链接或联系方式；若模型被完全恶意接管，唯一可能绕过硬门禁被误过的样本仅限于纯自然语言日常闲聊（`off-topic-chat`，如记录午餐生活且不含任何商业/注入词汇的内容）。**官方强烈推荐保持 auto-approve 为 OFF**。
- **机器人是带工具的智能体时（无人值守与智能体协同最终方案）**：
  - 服务端定时任务（Cron）：每小时在服务器上使用站点自身的 API 模型运行审核脚本 `scripts/recall-moderator.mjs --apply --auto-approve --state <state-file> --calibration-cache <cache-file>`；
  - 自动分流处置：正常合规机经自动批准入库（approve），明确的垃圾与广告自动拒绝（reject），存疑或潜在注入内容保持待审状态（pending）等待站长人工处理；
  - 智能体仅查询计数：运营机器人定期轮询计数端点 `GET /api/study-plan/admin/recalls/summary`，当且仅当 `pending > 0` 时提醒站长前往后台复核；
  - 权限与上下文物理隔离：机器人的审核令牌在服务端严格为只拒不批（reject-only），且机器人完全无需读取机经投稿正文，彻底杜绝提示词注入风险；
  - 残留风险：开启 `--auto-approve` 时，完全避开所有已知规则的新型隐蔽日常闲聊（off-topic）可能绕过模型，但确定性门禁保证其绝不含链接或联系方式，智能体本身永不接触原始提交文本。
- **爆炸半径防护**：默认 `--dry-run` 仅输出决策不发起变更；`--apply` 必须显式指定；具备单次处理上限（默认 50 条）与自动通过上限（默认 20 条，超额自动转 `hold`）；各题目独立评估互不干扰。
- **凭据与日志隔离**：审核令牌与 API 密钥仅由环境变量读取，绝不记录到日志中，亦不传入模型提示词；JSON Lines 日志仅记录 ID、裁定、推荐建议、原因枚举、模型名、harness 版本与截断摘要（最多 80 字；在 `--no-excerpt` 下不包含任何文本摘要）。

**使用命令**：
```bash
# 1. 校准测试（检查提供商模型一致率与 0 误过，汇报两种模式结果，退出码 0/1）
STUDY_AI_PROVIDER=mock STUDY_AI_MODEL=mock-1 node scripts/recall-moderator.mjs --calibrate

# 2. 预演审核（默认 dry-run，auto-approve 默认关闭，输出分流清单，不向服务器发起变更）
RECALL_API_BASE=http://127.0.0.1:8787 RECALL_API_TOKEN=your-token STUDY_AI_PROVIDER=mock node scripts/recall-moderator.mjs --dry-run

# 3. 提交审核结果（推荐模式：auto-approve 关闭，仅向 API 提交 reject 过滤垃圾，通过项在后台批量批准）
RECALL_API_BASE=http://127.0.0.1:8787 RECALL_API_TOKEN=your-token RECALL_API_ORIGIN=https://french.paytonpei.top STUDY_AI_PROVIDER=openai STUDY_AI_MODEL=gpt-4.1-mini STUDY_AI_API_KEY=... node scripts/recall-moderator.mjs --apply --max-items 50 --log logs/moderation.jsonl

# 4. 全自主自动审核（需显式开启 --auto-approve）
RECALL_API_BASE=http://127.0.0.1:8787 RECALL_API_TOKEN=your-token RECALL_API_ORIGIN=https://french.paytonpei.top STUDY_AI_PROVIDER=openai STUDY_AI_MODEL=gpt-4.1-mini STUDY_AI_API_KEY=... node scripts/recall-moderator.mjs --apply --auto-approve --max-items 50 --max-approve 20 --log logs/moderation.jsonl

# 5. 服务端无人值守定时运行（每小时运行，利用状态文件跳过已挂起项，利用校准缓存避免重复校准）
RECALL_API_BASE=http://127.0.0.1:8787 RECALL_API_TOKEN=your-token RECALL_API_ORIGIN=https://french.paytonpei.top STUDY_AI_PROVIDER=openai STUDY_AI_MODEL=gpt-4.1-mini STUDY_AI_API_KEY=... node scripts/recall-moderator.mjs --apply --auto-approve --state data/recall-state.json --calibration-cache data/recall-cal-cache.json --log logs/moderation.jsonl

# 6. 确定性规则模式（纯确定性规则清洗，无模型调用，无题干文本泄漏）
RECALL_API_BASE=http://127.0.0.1:8787 RECALL_API_TOKEN=your-token node scripts/recall-moderator.mjs --rules-only --no-excerpt --apply --log logs/moderation.jsonl
```

### 审核令牌相关服务端变量

- `STUDY_RECALL_MODERATOR_TOKEN`: token that can only list/approve/reject exam recalls (reject-only by default).
- `STUDY_RECALL_MODERATOR_CAN_APPROVE`: default `false` (only exactly `'true'` or `'1'` enables). When false, approve requests from the moderator token are rejected with 403 `RECALL_MODERATOR_REJECT_ONLY`.
