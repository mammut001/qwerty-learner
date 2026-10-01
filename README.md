# Qwerty Français — TCF Canada

一个只保留法语内容的 Qwerty Learner fork，用打字练习记忆 TCF Canada 高频词汇与表达。

## 当前内容

目前共 **1,144 个学习项**，按学习阶段组织：

- **基础 A1-A2**：基础核心词、人物与日常作息、基础形容词与副词、日常生活主题
- **B1 实用提升**：工作/学习/行政、B1 连接词、动词与固定介词、公共服务与社会生活
- **B2 冲刺**：观点表达、抽象名词、高频搭配
- **TCF 专项**：口语/写作核心表达、口语任务 2 高频提问、正式邮件与论证

## 特点

- 只展示法语词库，不保留原版英语、日语、德语等词库。
- 默认语言与默认词库均为法语 / TCF Canada。
- Gallery 按 A1-A2 → B1 → B2 → TCF 专项分区。
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

## Upstream

本项目基于 [RealKai42/qwerty-learner](https://github.com/RealKai42/qwerty-learner) 修改。原项目许可证见本仓库 `LICENSE`，衍生版本继续遵守相应开源许可。
