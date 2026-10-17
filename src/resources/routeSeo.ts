export interface RouteSeoItem {
  path: string
  title: string
  description: string
  h1: string
  intro: string
}

export const SITE_NAME = 'Qwerty Français'
export const SITE_SUFFIX = 'TCF Canada 法语｜Qwerty Français'

export const ROUTE_SEO: RouteSeoItem[] = [
  {
    path: '/',
    title: 'Qwerty Français — TCF Canada 法语打字背词',
    description:
      '专为 TCF Canada 考生打造的法语备考平台。通过打字与点选模式高效背诵 A1–B2 分级高频词汇，提供真人发音、动词变位练习、语法专项训练与考试真题回忆，助力突破加拿大移民 NCLC 7 分大关。',
    h1: 'Qwerty Français — 面向 TCF Canada 的法语学习与备考平台',
    intro: '专为加拿大移民 TCF Canada 考生打造，结合键盘打字与手机点选背词，助你高效突破词汇、变位、语法与听说读写各科难关。',
  },
  {
    path: '/typing',
    title: `打字背词 — ${SITE_SUFFIX}`,
    description:
      '基于键盘打字的法语词汇记忆工具，涵盖 A1–B2 分级词库与 TCF Canada 高频核心词汇。通过肌肉记忆与标准双口音即时发音，帮助考生快速掌握拼写、词义与发音，打牢听说读写词汇根基。',
    h1: '法语打字背词',
    intro: '通过键盘打字练习 TCF Canada 高频词汇，结合肌肉记忆与双口音朗读快速牢记拼写与释义。',
  },
  {
    path: '/tap',
    title: `点选模式·手机背法语单词 — ${SITE_SUFFIX}`,
    description:
      '专为手机与平板触摸屏设计的法语点选背词模式，免去复杂键盘输入，利用碎片时间高效刷词。支持 TCF Canada A1–B2 分级核心词库、发音朗读与错题自动归纳，轻松提升复习效率。',
    h1: '点选模式·手机背法语单词',
    intro: '专为移动设备优化的快速点选背词模式，随时随地利用碎片时间刷 TCF Canada 核心词汇。',
  },
  {
    path: '/gallery',
    title: `词汇图库 — ${SITE_SUFFIX}`,
    description:
      '通过视觉图解与场景分类学习 TCF Canada 常用核心词汇，结合图片、双语解释与真实发音，加深视觉联想记忆。适合视觉型学习者在场景中掌握生词，提升阅读与口语表达的词汇联想速度。',
    h1: '法语词汇图库',
    intro: '图文结合的直观法语词汇学习，通过生活与考试场景图像强化视觉联想记忆。',
  },
  {
    path: '/dictionary',
    title: `法语词典 — ${SITE_SUFFIX}`,
    description:
      '轻量快捷的法语备考词典，提供详尽的中文释义、词性标注、标准发音及动词变位速查。深度结合 TCF Canada 考试语境与经典例句，帮助学习者精准理解词汇用法，排除备考中的生词障碍。',
    h1: '法语学习词典',
    intro: '快速查询法语单词释义、词性、变位及真实考试例句，支持离线与本地检索。',
  },
  {
    path: '/word-lists',
    title: `自定义词表 — ${SITE_SUFFIX}`,
    description:
      '支持个性化定制的法语生词本与复习词表，用户可自由创建、导入导出或批量管理专属词单。结合打字与点选模式针对个人薄弱词汇进行专项突破，让 TCF Canada 词汇复习更加精准高效。',
    h1: '自定义法语词表',
    intro: '根据个人备考薄弱点创建专属词表，导入导出词单并针对性开展强化练习。',
  },
  {
    path: '/conjugation',
    title: `动词变位 — ${SITE_SUFFIX}`,
    description:
      '覆盖法语常用直陈式、虚拟式、条件式等核心时态的动词变位速查与专项练习。通过反复键入与交互测验强化记忆规则及不规则动词变化，攻克 TCF Canada 写作与语法考试中的变位难点。',
    h1: '法语动词变位练习',
    intro: '系统化训练常用规则与不规则法语动词变位，夯实书面与口语表达根基。',
  },
  {
    path: '/grammar-session',
    title: `语法练习 — ${SITE_SUFFIX}`,
    description:
      '围绕 TCF Canada 考试核心语法考点设计的交互式专项练习，涵盖冠词、代词、介词、时态配合等高频题型。提供详细中文解析与即时答题反馈，帮助考生查漏补缺，快速提升语法单项成绩。',
    h1: '法语语法专项练习',
    intro: '针对 TCF Canada 常考语法考点，通过精选习题与即时解析攻克语法薄弱环节。',
  },
  {
    path: '/tenses',
    title: `法语时态 — ${SITE_SUFFIX}`,
    description:
      '全面梳理法语主要时态的构成规则、用法区别与时态配合逻辑，重点解析复合过去时、未完成过去时等易混考点。搭配典型例句与专项训练，助你理清法语时态脉络，在 TCF 考试中从容应对。',
    h1: '法语时态系统精讲',
    intro: '全面梳理法语时态体系与用法规则，对比易混淆时态并辅以情境练习。',
  },
  {
    path: '/recalls',
    title: `TCF 真题回忆 — ${SITE_SUFFIX}`,
    description:
      '汇集最新 TCF Canada 考试真实机经与考友回忆题目，包含听力、阅读、口语和写作常考主题与典型题型。帮助备考考生熟悉实考节奏与出题方向，掌握最新考场动态，更有针对性地冲刺高分。',
    h1: 'TCF Canada 真题回忆与考题汇总',
    intro: '汇集考生真实机考回忆考题与高频机经，了解最新出题趋势与实考难度。',
  },
  {
    path: '/tcf-listening',
    title: `TCF 听力练习 — ${SITE_SUFFIX}`,
    description:
      '专为 TCF Canada 听力理解科目设计的模拟练习与精听工具，收录贴近实考难度的音频素材与各类场景对话。通过阶梯式听音训练与答题分析，全面提升听觉敏锐度与信息捕捉能力，突破听力难关。',
    h1: 'TCF Canada 听力专项练习',
    intro: '还原机考听力环境，精听真实语速音频与高频考题，冲刺 NCLC 7 听力分数。',
  },
  {
    path: '/video-listening',
    title: `视频听力 — ${SITE_SUFFIX}`,
    description:
      '精选加拿大魁北克与法国真实视频语料，专为 TCF Canada 考生打造的视频精听与复读练习工具。支持变速播放、A-B 循环复读与盲听对照模式，帮助攻克真实语速与魁北克口音，全面提高法语听力理解能力。',
    h1: '法语视频精听与发音练习',
    intro: '精选加拿大、魁北克与法国真实新闻与演讲视频，结合变速与 A-B 复读功能磨耳朵。',
  },
  {
    path: '/tcf-reading',
    title: `TCF 阅读练习 — ${SITE_SUFFIX}`,
    description:
      '针对 TCF Canada 阅读理解科目定制的强化训练，包含日常便条、通知广告、媒体报道与深度论述等真实题材。通过计时阅读与针对性题目解析，培养关键信息检索与主旨推理能力，稳步提高阅读得分。',
    h1: 'TCF Canada 阅读专项练习',
    intro: '精选实用图文、通知、信件及长篇论述材料，培养快速抓取关键信息的阅读能力。',
  },
]

export const routeSeo = ROUTE_SEO
export default ROUTE_SEO
