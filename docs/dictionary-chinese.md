# 离线中文释义维护

2026-10-13 增补：包含本站词表释义的中文词头从 13,355 增至 22,373（增加 9,018）。统计按词头去重，不按义项计数，也不把所有变位形式算成独立覆盖。原有中文释义、本站词表释义和变位映射均保留。

## 数据来源与规则

- 中文维基词典的法语条目：[Kaikki 数据页](https://kaikki.org/zhwiktionary/%E6%B3%95%E8%AF%AD/index.html)。保留原先因英文词典缺少对应词头而被丢弃的中文条目。
- 法语维基词典法语条目中的中文/普通话翻译表：[Kaikki 原始数据页](https://kaikki.org/frwiktionary/rawdata.html)。仅接收直接中文译词，不通过英语中转。
- 少量重点词的中文摘要：`scripts/dictionary-chinese-reviewed.json`。每项记录法语原始定义页面和核对日期，包括 rite、rituel、remonter、embaucher。

增补按词头和词性匹配，不覆盖已有中文定义；排除专名、词缀、变形义项和带有过时标签的增补释义，转为简体并去重，每个词性最多保留六项。数据采用 CC BY-SA 4.0，详见 `public/lexicon/LICENSE.md`。

公开词典仍有缺口，因此本次没有承诺所有词都已拥有中文释义；在线补查和缺失提示继续生效。

## 重建与增量更新

完整构建会自动执行中文增补：

```sh
npm run build:dictionary
```

只增补现有离线词典：

```sh
node scripts/enrich-dictionary-chinese.mjs
node --test scripts/enrich-dictionary-chinese.test.mjs
```

原始文件缓存在 `.tmp/dictionary/`，不提交到 Git；法语版压缩源约 703 MB，流式解析，不需要一次载入内存。两份数据都成功解析后才写词典分片。重复执行不会覆盖已有释义。需要获取更新源时，删除缓存的 `fr-zh.jsonl` 与 `fr-raw.jsonl.gz` 后重新运行。可用 `--source-dir` 指定源目录，`--out-dir` 指定增量输出目录。

发布后，词典分片 URL 带构建版本参数，让新页面使用新数据，避免继续命中旧的离线缓存。
