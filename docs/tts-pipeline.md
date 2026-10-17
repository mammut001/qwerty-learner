# 发音音频生成与质检管线 (TTS Pipeline)

本项目（Qwerty Français / TCF Canada）包含词汇发音、TCF Canada 听力模考题与精听短文（Intensive Listening）。本文档详细记录发音合成的技术架构、历史决策演进、核心模块实现、自动化质检与人工验收标准，以及新增文本/词汇的标准操作检查清单（SOP）。

---

## 1. 架构总览与音频类型

语音合成主要采用 **Google Cloud Text-to-Speech (Chirp 3 HD)** 引擎，并通过自建镜像服务加速分发。

```
[原始文本 (短文 / 听力题 / 词库)]
       │
       ▼
[文本预处理 (ttsSentenceFixes / speakableText)]
       │
       ▼
[省音与变音注音 (ttsElisionIpa / ttsSsml / ttsSpokenOverrides)]
       │
       ▼
[Google Cloud TTS API (Chirp 3 HD)]
       │
       ├──> GCS Bucket (tcf-voice-tcf-canada-5b8c2)
       │       │
       │       ▼ (sync-voice-mirror.mjs)
       └──> VPS 本地镜像目录 (由 Nginx 同源托管在 /voice-audio)
               │
               ▼
       [Deepgram Nova-3 ASR 质检] ──> [人工试听复核]
```

### 1.1 音频类型与声音配置

| 类型 | 目标受众与场景 | 选用音色 / 配置 | 存储路径 / 清单 |
| :--- | :--- | :--- | :--- |
| **词汇发音** | 词库练习、词典查询、打字发音 | `fr-CA-Chirp3-HD-Achird` (魁北克加法)<br>`fr-FR-Chirp3-HD-Achird` (法国欧法) | `v1/<accent>/<key>.mp3`<br>清单: `public/voice/tts-manifest.json` |
| **真人录音覆盖** | 核心单词（优先于 TTS） | 来自 Lingua Libre / Wikimedia Commons | `ll/<decoded_filename>`<br>清单: `public/voice/fr-overrides.json` |
| **TCF 听力模考** | CO 听力 39 题（对话/独白/广播） | 对话：男声 Achird 与女声 Aoede 交替<br>独白：公告广播用女声 Aoede，其余用男声 Achird<br>语速：`0.95` | `listening/v1/<key>.mp3`<br>清单: `public/voice/tcf-listening-manifest.json` |
| **精听短文** | 短文听写与逐句跟读（12+ 篇短文） | 男声 Achird / 女声 Aoede（按短文人物角色配置）<br>语速：`0.95`<br>按单句独立合成并解析 MP3 帧计算起止时间戳 | `intensive/v1/<key>.mp3`<br>清单: `public/voice/intensive-listening-manifest.json` |

---

## 2. 决策记录 (Architecture Decision Record)

在引入 Google Chirp 3 HD 模型初期，我们针对法语连写、省音（Elision）与特殊前缀合成展开了深入实验，形成了以下核心技术决策：

### 2.1 问题背景：原样文本随机读错

Google Chirp 3 HD 在遇到法语连写/省音缩合（如 `c'est`, `l'été`, `d'ailleurs`, `aujourd'hui`）以及特定前缀词（如 `réévaluer`, `réaménager`）时，原样文本合成会随机产生严重的拼读缺陷——将撇号或带重音字母按字母名称念出（例如将 `l'été` 读成 *"l apostrophe été"*，将 `réévaluer` 读成 *"r e accent aigu e accent aigu value"*）。

### 2.2 方案实验与对比

1. **实验一：直接去除撇号（如 `d'été` -> `dété`）**
   - **结果**：**失败**。去除撇号会破坏法语自然音节切分与词根重音。例如 `d'été` 变成 `dété` 会导致元音变质；`c'est` 变成 `cest` 会被误读或不发音。
2. **实验二：原样文本直送（Raw Text）**
   - **结果**：**失败**。读错现象呈现随机性，同一批次合成的短文中部分句子正常，部分句子产生字母名拼读，无法在线上生产环境接受。
3. **实验三：SSML `<phoneme alphabet="ipa" ph="...">` 标签精准注音**
   - **结果**：**最佳方案**。通过构建省音词典，将省音片段提取为国际音标（IPA）并通过 SSML `<phoneme>` 元素包裹（例如 `<phoneme alphabet="ipa" ph="lete">l'été</phoneme>`），Chirp 引擎能 100% 准确发出连音，彻底根治撇号拼读问题。
4. **实验四：Chirp 拒绝 `ɲ` 音标与 `'say'` 回退机制**
   - **结果**：Chirp 引擎内部解析存在缺陷，当 SSML `<phoneme ph="...">` 中包含硬腭鼻音 `ɲ`（如 `d’oignon` 的 IPA `/dɔɲɔ̃/`）时，TTS API 会直接报错拒绝合成。
   - **解决方案**：在注音词典中设计 `"say"` 回退字段。当词条存在 `say` 属性时，跳过 `<phoneme>` 标签，直接将省音词替换为安全的文本替换形式（例如 `d’oignon` 配置 `"say": "doignon"`）。

### 2.3 同形异音陷阱 (Homograph Traps)

在构建词根音标映射时，存在同形异音词（Homographs）陷阱：
- 最典型的例子是 **`est`**：
  - 动词 *être* 第三人称单数形式：发音为 `/ɛ/`（用于 `c'est`, `n'est`, `qu'est` 等）；
  - 方位名词“东”（*l'est*）：发音为 `/ɛst/`。
- 如果简单使用外来词典进行无差别词形匹配，词典往往优先命中名词方位词 `/ɛst/`，导致构建出来的省音音标变成 `c'est` -> `/sɛst/`、`n'est` -> `/nɛst/`、`qu'est` -> `/kɛst/`。
- **解决规则**：高频核心省音词（`c'est`, `n'est`, `qu'est` 等）严禁依赖词典自动推导，必须在 `src/utils/ttsElisionIpa.json` 中标记为 `"source": "manual"` 并显式锁定精准音标（如 `c’est: "sɛ"`, `n’est: "nɛ"`, `qu’est: "kɛ"`）。

---

## 3. 核心代码模块与实现原理

### 3.1 `src/utils/ttsKey.mjs`：文本规范化与缓存键计算

- **`speakableText(name)`**：清洗词库展示文本中的元符号。
  - 去除 `+ <placeholder>`（如 `avoir besoin de + nom` -> `avoir besoin de`）；
  - 展开 `X de / que` 为 `X de, X que`（如 `afin de / que` -> `afin de, afin que`）；
  - 剥离 `(e)` 阴性后缀标记；
  - 合并空白并保留句末标点（如问号、省略号）。
- **`spokenTextFor(name, accent, options)`**：
  1. 优先读取 `src/utils/ttsSpokenOverrides.json`（或 `.mjs`）中针对当前口音（`fr-CA` / `fr-FR`）的手动重写；
  2. 执行 `speakableText` 与 `applyTtsSentenceFixes`；
  3. 若包含省音结构，调用 `loadElisionIpaDict` 与 `findMissingElisionCombos`。若全部省音均有音标或 say 替换，则输出 SSML；若有缺失，退回普通文本。
- **`computeTtsKey(voice, text, accent)`**：
  - 核心散列：计算 `sha256('v1|' + voice + '|' + spokenText)`，取前 16 位十六进制字符。
  - 该纯 JS 实现同时兼容 Node.js 与浏览器端。

### 3.2 `src/utils/ttsSentenceFixes.mjs`：特定前缀拼读修复

Chirp 会将特定前缀拆分念出字母重音：
- `réévalu*`（如 `réévaluer`, `réévaluation`）：Chirp 念成 *"r e accent aigu..."*。通过正则替换为加连字符形式 `ré-évalu*`，强制合成自然连读发音。
- `réaménag*`（如 `réaménager`, `réaménagement`）：Chirp 念成 *"r e accent aigu a ménagé"*。替换为 `ré-aménag*`。
- **注意**：该修复仅在合成请求前生效，UI 展示文本、听力原文、字幕文本完全保留标准法语拼写。

### 3.3 `src/utils/ttsSsml.mjs`：SSML 格式化与音标注入

- **前缀音标映射 `PREFIX_IPA`**：包含 `l'` (`l`), `d'` (`d`), `j'` (`ʒ`), `m'` (`m`), `n'` (`n`), `s'` (`s`), `t'` (`t`), `c'` (`s`), `qu'` (`k`), `jusqu'` (`ʒysk`), `lorsqu'` (`lɔʁsk`), `puisqu'` (`pɥisk`), `quoiqu'` (`kwak`), `presqu'` (`pʁɛsk`)。
- **`formatTtsSsml(text, options)`**：
  - 转义 XML 实体（`&`, `<`, `>`）；
  - 逐个匹配省音片段：
    - 若词典中有 `say`：替换为转义后的 `say` 文本；
    - 若词典中有 `ipa`：包装为 `<phoneme alphabet="ipa" ph="${ipa}">${raw}</phoneme>`；
    - 若缺失音标且 `allowMissing: false`：直接抛错阻断合成；
  - 最外层包裹 `<speak>...</speak>`。

### 3.4 `src/utils/ttsElisionIpa.json` 与 `scripts/build-elision-ipa.mjs`

- **自动建库**：`scripts/build-elision-ipa.mjs` 扫描项目全部语料：
  1. `src/resources/intensiveListening.ts`（精听短文全部句子）；
  2. `src/resources/tcfMock.ts`（TCF 模考 Set A 听力原文）；
  3. `src/resources/tcfMockSetB.ts`（TCF 模考 Set B 听力原文）；
  4. `public/dicts/*.json`（词库中的单词与词组）。
- **词典查询与拼接**：针对形如 `prefix'word` 的词条，在 `public/lexicon/fr/<shard>.json` 中查找词根音标，与前缀音标拼接生成初稿，标记为 `"source": "lexicon"`。
- **人工干预条目**：词根缺失或存在多音义的标记为 `"source": "manual"`。
- **伴生模块同步**：脚本同时输出 `src/utils/ttsElisionIpa.mjs`，确保在 ESM、TypeScript 及 Vite 前端打包下均能零运行时损耗加载。

---

## 4. 听力与短文合成脚本

### 4.1 词库发音合成：`scripts/build-tts-audio.mjs`

- **用法**：
  ```bash
  node scripts/build-tts-audio.mjs [--only-elision] [--accent=fr-CA|fr-FR] [--limit=N] [--concurrency=4] [--dry-run]
  ```
- **特性**：
  - 支持 `--only-elision`：只针对含有省音的词条更新或合成；
  - 严格限速：`paceRequest` 保证不超过 240 requests/min，规避 GCP 300 RPM 限制；
  - 凭据获取：优先从环境变量 `GOOGLE_APPLICATION_CREDENTIALS`，其次为默认路径 `~/.config/gcloud/tts-key.json`；
  - 自动更新 `public/voice/tts-manifest.json`。

### 4.2 TCF 模考听力合成：`scripts/build-tcf-listening-audio.mjs`

- **用法**：
  ```bash
  node scripts/build-tcf-listening-audio.mjs [--only=co-1] [--rate=0.95] [--dry-run]
  ```
- **对话多角色交替与音频拼接**：
  - 对话文本使用破折号 `—` 分隔各轮发言（turn）；
  - `splitTurns` 拆分后，偶数轮分配男声 `fr-CA-Chirp3-HD-Achird`，奇数轮分配女声 `fr-CA-Chirp3-HD-Aoede`；
  - **音频拼接方案**：Chirp 3 HD 不支持 SSML `<break>` 停顿标签。系统采用相同编码配置（`MP3, 24000Hz`）逐轮合成，直接将二进制 MP3 Buffer 顺序拼接（`Buffer.concat`）。各平台原生解码器与浏览器 HTML5 Audio 均能平滑解码，还原真实的自然对话停顿。
  - 清单记录：`public/voice/tcf-listening-manifest.json` 记录题目 ID 到 Key 的映射。

### 4.3 精听短文句子级合成与对齐：`scripts/build-intensive-listening-audio.mjs`

- **用法**：
  ```bash
  node scripts/build-intensive-listening-audio.mjs [--only=boulangerie-matin] [--rate=0.95] [--dry-run]
  ```
- **核心机制：逐句合成与精确帧长解析**：
  1. 短文中的每一句话按角色分配声音，单独调用 TTS API 合成独立的 MP3 片段；
  2. 使用纯 JS 实现的 **`parseMp3Duration`** 解析 MPEG-2 Layer III 帧头（在 24000Hz 下每帧 576 采样 = 24ms），无需外部二进制工具（如 ffmpeg/sox）即可计算出毫秒级精确时长；
  3. 累加计算出每句话的高精度时间轴：
     ```json
     {
       "key": "4c698110b9797274",
       "segments": [
         { "start": 0, "end": 2.136 },
         { "start": 2.136, "end": 4.872 }
       ]
     }
     ```
  4. 顺序拼接全篇音频并上传，更新 `public/voice/intensive-listening-manifest.json`。

---

## 5. 质量保证体系 (QA & Verification)

### 5.1 自动化 ASR 筛查：`scripts/tts-qa-deepgram.mjs`

自动化质检基于 Deepgram ASR（`nova-3` 模型，`language=fr`）反向转写生成的音频，并进行异常 Token 探测：

```bash
# 检查全部精听短文
DEEPGRAM_API_KEY=... node scripts/tts-qa-deepgram.mjs intensive

# 检查特定短文
DEEPGRAM_API_KEY=... node scripts/tts-qa-deepgram.mjs intensive --only=boulangerie-matin

# 检查 TCF 模考听力
DEEPGRAM_API_KEY=... node scripts/tts-qa-deepgram.mjs tcf-listening
```

- **缺陷探测特征 (`src/utils/ttsQaHelpers.mjs`)**：
  1. **孤立省音辅音字母 (`LONE_ELIDED_TOKENS`)**：如转写出独立的 `s`, `l`, `d`, `j`, `m`, `n`, `t`, `c`, `qu`，通常表明 TTS 将撇号读成了字母名；
  2. **拼读标点/变音词 (`SPELLED_PUNCTUATION_TOKENS`)**：如转写出 `accent`, `aigu`, `grave`, `apostrophe`, `circonflexe`, `cédille`, `tiret` 等单词；
- **误报排除与白名单**：
  - **悦耳音 `-t-` (Euphonic -t-)**：如原文含有 `a-t-il`、`va-t-on`，转写出的孤立 `t` 会被自动识别为正常现象并豁免；
  - **例外配置文件 `scripts/tts-qa-ignore.json`**：例如 TCF 听力 `co-11` 原文为加拿大航空航班号 `AC 123`，转写出现单字母 `c` 属于正规读音，在此配置中声明忽略。
- **精听短文精确定位**：
  - 结合清单中的 `segments` 时间轴，脚本能直接将缺陷发生的秒数精准映射到短文第几句及句子法文原文，极大缩短排查耗时。

### 5.2 盲测结论：QA 只是初筛，教学音频必须人工全量试听

> [!IMPORTANT]
> **质检盲测实验记录 (Blind Test Finding)**：
> 在前期的质量验收盲测中，**自动化 ASR 筛查漏掉了人工标记缺陷中的 3/11（近 27% 的漏检率）**。
>
> **ASR 筛查漏检的原因包括**：
> - 某些发音错误虽然音素不准，但 ASR 语言模型凭借上下文自动“纠错”还原了文本；
> - 连诵（Liaison）断句怪异、轻重音倒错或语调不自然，ASR 转写无法体现；
> - 极短的吞音或拖音现象未达到 ASR 标记为单独词汇的阈值。
>
> **质量红线**：自动化 QA 仅用于拦截低级拼读事故与规模化初筛。**所有用于教学与模考的固定录音，在正式发布前必须由人工逐句试听复核！**

---

## 6. GCS 存储限制与 VPS 镜像运维

### 6.1 GCS Service Account 不可覆写对象（No-Overwrite 约束）

> [!WARNING]
> **权限限制**：
> Google Cloud 存储桶（`tcf-voice-tcf-canada-5b8c2`）配置了安全策略，部署的 Service Account **仅具备创建/写入权限，没有覆写（Overwrite）或删除已有对象的权限**。
>
> 如果某个已经上传的 key 发现音频有问题，直接再次调用脚本上传会遭遇权限拒绝或静默失败。

### 6.2 修复线上错误音频的标准流程

当需要在同一 key 下修正错误发音时：
1. **备份 VPS 镜像中的旧音频**：
   在 VPS 上定位到目标文件（如 `/var/www/voice-audio/intensive/v1/<key>.mp3`），先执行备份：
   ```bash
   cp <key>.mp3 <key>.mp3.bak
   ```
2. **仅覆写 VPS 镜像文件**：
   在本地合成出正确的音频后，通过 `scp` 或 `rsync` 直接替换 VPS 镜像目录下的对应音频文件。
3. **避免触发 GCS 上传失败**：
   因为客户端优先通过 VPS 同源 `/voice-audio` 读取音频，覆盖 VPS 文件即可立即对所有用户生效，而无需修改 GCS 对象。

### 6.3 镜像同步脚本：`scripts/sync-voice-mirror.mjs`

生产环境 VPS 定期通过此脚本拉取最新音频，确保完全离线可用且避免跨域与网络抖动：

```bash
# 在 VPS 上同步所有音频至 /voice-audio 静态目录
node scripts/sync-voice-mirror.mjs --dir /path/to/voice-audio --concurrency 8
```

- **镜像目录布局**：
  - `v1/<accent>/<key>.mp3`（GCS 词库发音）
  - `ll/<decoded_filename>`（Lingua Libre 真人录音覆盖）
  - `listening/v1/<key>.mp3`（TCF 模考听力）
  - `intensive/v1/<key>.mp3`（精听短文）
- **安全原子写入**：下载至 `<file>.part` 临时文件，下载成功后再原子性重命名为正式文件；已有非空文件自动跳过。

---

## 7. 增添新短文 / 新词库操作清单 (Step-by-Step Checklist)

当你编写了一篇新的精听短文（在 `src/resources/intensiveListening.ts` 中添加），或新增了 TCF 模考题 / 词库时，请严格遵守以下 9 步操作清单：

- [ ] **步骤 1：编写与校验文本 (Write Text)**
  - 在短文中检查是否有生僻省音、连字符或复合词。
- [ ] **步骤 2：自动扫描并构建省音字典 (Build Elision IPA)**
  - 运行命令更新省音库：
    ```bash
    node scripts/build-elision-ipa.mjs
    ```
  - 检查控制台输出的统计数据与 TODO 表格。
- [ ] **步骤 3：人工核对并补全缺失 IPA (Fill Empty IPA by Hand)**
  - 打开 `src/utils/ttsElisionIpa.json`；
  - 针对控制台列出的 `"source": "manual"` 或 `ipa: ""` 的新词条，手动填入准确音标；
  - **防坑检查**：检查新词条是否含有 `est` 动词（必须为 `/ɛ/` 而不能是 `/ɛst/`）；
  - **Chirp 特性检查**：若音标包含 `ɲ`，必须改用 `"say"` 属性配置替代文本（如 `"say": "xxx"`）；
  - 保存后，确保 `src/utils/ttsElisionIpa.mjs` 伴生文件已同步更新。
- [ ] **步骤 4：运行音频合成脚本 (Synthesize Audio)**
  - 根据类型执行对应命令（带凭据）：
    ```bash
    # 精听短文
    node scripts/build-intensive-listening-audio.mjs --only=<passage-id>

    # 词汇发音（省音）
    node scripts/build-tts-audio.mjs --only-elision

    # TCF 模考听力
    node scripts/build-tcf-listening-audio.mjs --only=<question-id>
    ```
- [ ] **步骤 5：运行自动化 ASR 质检 (Automated QA)**
  - 执行 Deepgram QA 校验，确保 0 defects：
    ```bash
    DEEPGRAM_API_KEY=... node scripts/tts-qa-deepgram.mjs intensive --only=<passage-id>
    ```
  - 若有误报（如特殊品牌名或合法单字母），在 `scripts/tts-qa-ignore.json` 添加说明与例外。
- [ ] **步骤 6：人工试听复核 (Human Listen - 关键红线)**
  - 戴上耳机，逐句完整试听一遍生成的音频；
  - 重点聆听：省音过渡是否自然、是否有奇怪卡顿、断句与连诵是否符合法语语法。
- [ ] **步骤 7：提交 Manifest 与代码变更 (Commit Manifest & Dict)**
  - 提交更新的清单文件和词典：
    ```bash
    git add src/utils/ttsElisionIpa.* public/voice/*-manifest.json src/resources/...
    git commit -m "feat(audio): add audio and manifest for <name>"
    ```
- [ ] **步骤 8：发布部署前端与后端 (Deploy)**
  - 部署最新代码，确保前端载入包含新 key 与时间轴的 manifest。
- [ ] **步骤 9：同步 VPS 镜像 (Sync Mirror)**
  - 登录 VPS，运行镜像同步脚本拉取最新音频：
    ```bash
    node scripts/sync-voice-mirror.mjs --dir /data/voice-audio
    ```
  - 浏览器访问页面，确认音频流畅加载自 `/voice-audio`。
