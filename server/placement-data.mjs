/** Placement test content & scoring (TCF Canada / CEFR oriented). Shared by API validation and the web UI. */

export const PLACEMENT_SECTIONS = ['vocabulary', 'grammar', 'reading']

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2']
const RESULT_LEVELS = ['A1', 'A2', 'B1', 'B2', 'B2+']

export const PLACEMENT_QUESTIONS = [
  // —— Vocabulary A1 ——
  {
    id: 'v-a1-1',
    section: 'vocabulary',
    level: 'A1',
    prompt: '「bonjour」的意思是？',
    choices: ['再见', '你好', '谢谢', '对不起'],
    correctIndex: 1,
    explanation: 'bonjour = 你好（白天问候）。',
  },
  {
    id: 'v-a1-2',
    section: 'vocabulary',
    level: 'A1',
    prompt: '「merci」的意思是？',
    choices: ['请', '对不起', '谢谢', '你好'],
    correctIndex: 2,
    explanation: 'merci = 谢谢。',
  },
  {
    id: 'v-a1-3',
    section: 'vocabulary',
    level: 'A1',
    prompt: '「une maison」指什么？',
    choices: ['一辆车', '一所房子', '一本书', '一个朋友'],
    correctIndex: 1,
    explanation: 'maison = 房子；une = 阴性不定冠词「一个」。',
  },
  // —— Vocabulary A2 ——
  {
    id: 'v-a2-1',
    section: 'vocabulary',
    level: 'A2',
    prompt: '「Je voudrais réserver une table」中 réserver 最接近？',
    choices: ['取消', '预订', '打扫', '分享'],
    correctIndex: 1,
    explanation: 'réserver = 预订（餐厅、酒店等）。',
  },
  {
    id: 'v-a2-2',
    section: 'vocabulary',
    level: 'A2',
    prompt: '「Il pleut, prends ton parapluie」中 parapluie 是？',
    choices: ['围巾', '雨伞', '手套', '太阳镜'],
    correctIndex: 1,
    explanation: 'parapluie = 雨伞；il pleut = 下雨。',
  },
  {
    id: 'v-a2-3',
    section: 'vocabulary',
    level: 'A2',
    prompt: '「Je suis en retard au travail」中 en retard 表示？',
    choices: ['提前', '迟到', '生病', '放假'],
    correctIndex: 1,
    explanation: 'être en retard = 迟到。',
  },
  // —— Vocabulary B1 ——
  {
    id: 'v-b1-1',
    section: 'vocabulary',
    level: 'B1',
    prompt: '「malgré les difficultés」中 malgré 表示？',
    choices: ['因为', '尽管', '如果', '直到'],
    correctIndex: 1,
    explanation: 'malgré = 尽管（表让步）。',
  },
  {
    id: 'v-b1-2',
    section: 'vocabulary',
    level: 'B1',
    prompt: '「prendre une décision」的正确理解是？',
    choices: ['做一个决定', '犯一个错误', '进行一次旅行', '写一封信'],
    correctIndex: 0,
    explanation: '固定搭配 prendre une décision = 做决定。',
  },
  {
    id: 'v-b1-3',
    section: 'vocabulary',
    level: 'B1',
    prompt: '「s’occuper des enfants」中 s’occuper de 表示？',
    choices: ['忽视', '照顾/负责', '害怕', '比较'],
    correctIndex: 1,
    explanation: 's’occuper de = 照顾、处理、负责。',
  },
  // —— Vocabulary B2 ——
  {
    id: 'v-b2-1',
    section: 'vocabulary',
    level: 'B2',
    prompt: '「mettre en œuvre un projet」中 mettre en œuvre 表示？',
    choices: ['放弃项目', '实施/落实项目', '讨论项目', '资助项目'],
    correctIndex: 1,
    explanation: 'mettre en œuvre = 实施、落实（较正式）。',
  },
  {
    id: 'v-b2-2',
    section: 'vocabulary',
    level: 'B2',
    prompt: '「une augmentation sensible des prix」中 sensible 此处意为？',
    choices: ['敏感的', '明显的/相当大的', '合理的', '暂时的'],
    correctIndex: 1,
    explanation: 'sensible = 明显的、相当大的（与英语 sensible 不同）。',
  },
  {
    id: 'v-b2-3',
    section: 'vocabulary',
    level: 'B2',
    prompt: '「remettre en question」表示？',
    choices: ['重申', '对…提出质疑', '回答问题', '遵守规定'],
    correctIndex: 1,
    explanation: 'remettre en question = 质疑、重新审视。',
  },
  // —— Grammar ——
  {
    id: 'g-a2-1',
    section: 'grammar',
    level: 'A2',
    prompt: ' Hier, nous ___ au cinéma.',
    choices: ['allons', 'sommes allés', 'allions', 'irons'],
    correctIndex: 1,
    explanation: 'hier + 完成的事件 → passé composé：nous sommes allés。',
  },
  {
    id: 'g-a2-2',
    section: 'grammar',
    level: 'A2',
    prompt: 'Quand j’étais petit, je ___ du chocolat tous les jours.',
    choices: ['mangeais', 'ai mangé', 'mangerai', 'mange'],
    correctIndex: 0,
    explanation: '过去习惯、反复 → imparfait：je mangeais。',
  },
  {
    id: 'g-b1-1',
    section: 'grammar',
    level: 'B1',
    prompt: 'Si tu ___ à l’heure, nous n’aurions pas raté le train.',
    choices: ['arrives', 'étais arrivé', 'serais arrivé', 'arriveras'],
    correctIndex: 2,
    explanation: '非现实过去条件：Si + plus-que-parfait / conditionnel passé → serais arrivé。',
  },
  {
    id: 'g-b1-2',
    section: 'grammar',
    level: 'B1',
    prompt: 'Il faut que tu ___ tes documents avant vendredi.',
    choices: ['prépares', 'prépare', 'prépareras', 'préparais'],
    correctIndex: 0,
    explanation: 'il faut que + subjonctif → tu prépares。',
  },
  {
    id: 'g-b2-1',
    section: 'grammar',
    level: 'B2',
    prompt: 'Bien qu’il ___ fatigué, il a terminé le rapport.',
    choices: ['est', 'était', 'soit', 'sera'],
    correctIndex: 2,
    explanation: 'bien que + subjonctif → qu’il soit。',
  },
  {
    id: 'g-b2-2',
    section: 'grammar',
    level: 'B2',
    prompt: 'C’est le livre ___ je t’ai parlé la semaine dernière.',
    choices: ['que', 'dont', 'où', 'lequel'],
    correctIndex: 1,
    explanation: 'parler de quelque chose → dont（关系代词）。',
  },
  {
    id: 'g-b1-3',
    section: 'grammar',
    level: 'B1',
    prompt: 'Je ___ ce film trois fois déjà.',
    choices: ['vois', 'ai vu', 'voyais', 'verrai'],
    correctIndex: 1,
    explanation: 'déjà + 经历 → passé composé：j’ai vu。',
  },
  {
    id: 'g-b2-3',
    section: 'grammar',
    level: 'B2',
    prompt: '___ les inconvénients, nous avons accepté l’offre.',
    choices: ['Malgré', 'À cause de', 'Grâce à', 'Pendant'],
    correctIndex: 0,
    explanation: 'malgré = 尽管（让步）；à cause de = 因为；grâce à = 多亏。',
  },
  // —— Reading ——
  {
    id: 'r-a2-1',
    section: 'reading',
    level: 'A2',
    passage:
      'Bonjour,\n\nLa bibliothèque sera fermée samedi pour travaux. Elle rouvrira lundi à 9 h. Les réservations en ligne restent possibles.\n\nMerci de votre compréhension.',
    prompt: '根据短文，图书馆哪天重新开放？',
    choices: ['周六', '周日', '周一', '周二'],
    correctIndex: 2,
    explanation: 'rouvrira lundi = 周一再开放。',
  },
  {
    id: 'r-b1-1',
    section: 'reading',
    level: 'B1',
    passage:
      'De plus en plus de citoyens choisissent le vélo pour se rendre au travail. La ville a aménagé de nouvelles pistes cyclables et réduit la vitesse dans certains quartiers. Toutefois, certains usagers regrettent le manque de stationnements sécurisés.',
    prompt: '文中对现状的主要批评是什么？',
    choices: ['自行车道太多', '缺少安全停放处', '车速过快', '没人骑自行车'],
    correctIndex: 1,
    explanation: 'manque de stationnements sécurisés = 缺少安全停放处。',
  },
  {
    id: 'r-b2-1',
    section: 'reading',
    level: 'B2',
    passage:
      'Si l’intelligence artificielle transforme déjà le marché du travail, elle ne rend pas pour autant l’apprentissage des langues obsolète. Au contraire, la demande de compétences interculturelles augmente, car les outils automatiques peinent à saisir les nuances et le contexte social.',
    prompt: '作者对「学语言」的态度是？',
    choices: ['已经过时', '仍然重要甚至更重要', '只对儿童有用', '应完全交给 AI'],
    correctIndex: 1,
    explanation: 'ne rend pas obsolète + demande augmente → 仍然重要。',
  },
  {
    id: 'r-b2-2',
    section: 'reading',
    level: 'B2',
    passage:
      'Le gouvernement a annoncé une aide temporaire pour les ménages les plus touchés par la hausse des prix de l’énergie. Les oppositions estiment que ces mesures, bien qu’utiles, ne règlent pas la cause structurelle du problème.',
    prompt: '反对党如何看待该援助？',
    choices: ['完全拒绝任何帮助', '有用但未解决根本问题', '认为援助过高', '要求立即取消'],
    correctIndex: 1,
    explanation: 'utiles mais ne règlent pas la cause structurelle。',
  },
]

const QUESTION_BY_ID = new Map(PLACEMENT_QUESTIONS.map((q) => [q.id, q]))

export const MAX_PLACEMENT_HISTORY = 5

const sectionLabel = {
  vocabulary: '词汇辨认',
  grammar: '语法结构',
  reading: '阅读理解',
}

function bucket(level) {
  return { correct: 0, total: 0 }
}

function addScore(map, key, correct) {
  const row = map[key] ?? bucket()
  row.total += 1
  if (correct) row.correct += 1
  map[key] = row
}

function ratio(row) {
  if (!row || row.total === 0) return 0
  return row.correct / row.total
}

/**
 * CEFR placement: find highest band with ≥67% at that band and ≥50% on all lower bands.
 * B2+ when B2 ≥80% and overall ≥75%.
 */
export function deriveCefrLevel(levelScores) {
  const order = ['A1', 'A2', 'B1', 'B2']
  let placed = 'A1'
  for (const level of order) {
    const r = ratio(levelScores[level])
    if (r >= 0.67) placed = level
    else break
  }
  const lowerOk = order.slice(0, order.indexOf(placed)).every((lv) => ratio(levelScores[lv]) >= 0.5 || levelScores[lv]?.total === 0)
  if (!lowerOk && placed !== 'A1') {
    const idx = Math.max(0, order.indexOf(placed) - 1)
    placed = order[idx]
  }
  const overallCorrect = order.reduce((sum, lv) => sum + (levelScores[lv]?.correct ?? 0), 0)
  const overallTotal = order.reduce((sum, lv) => sum + (levelScores[lv]?.total ?? 0), 0)
  const overall = overallTotal ? overallCorrect / overallTotal : 0
  if (placed === 'B2' && ratio(levelScores.B2) >= 0.8 && overall >= 0.75) return 'B2+'
  return placed
}

export function analyzePlacementWeakness(placementResult) {
  const sections = ['vocabulary', 'grammar', 'reading']
  const ranked = sections
    .map((section) => ({
      section,
      ratio: ratio(placementResult.sectionScores?.[section]),
    }))
    .sort((a, b) => a.ratio - b.ratio)
  return {
    ranked,
    weakest: ranked[0]?.section ?? 'vocabulary',
    secondWeakest: ranked[1]?.section ?? 'grammar',
  }
}

/**
 * Aggressive daily personalization layered on top of the fixed 26-week roadmap.
 */
export function buildPlacementDailyBoost(placementResult) {
  const { ranked, weakest, secondWeakest } = analyzePlacementWeakness(placementResult)
  const rec = placementResult.recommendations
  const primaryDictId = rec.vocabularyDictIds[0] ?? 'tcf-canada-foundation-01'
  const grammarTopicId = rec.grammarTopicIds[0] ?? 'passe-compose-imparfait'

  const sectionTask = (section) => {
    if (section === 'vocabulary') {
      const vocabRatio = ranked.find((item) => item.section === 'vocabulary')?.ratio ?? 0
      return {
        id: 'smart-placement-focus',
        kind: 'placement',
        title: '定级主线 · 推荐词库',
        href: `/typing?dict=${primaryDictId}`,
        reason: `定级 ${placementResult.cefrLevel}：词汇 ${Math.round(vocabRatio * 100)}% 正确率，优先跟打推荐词库（与日历周并行，不替代 26 周主线）。`,
      }
    }
    if (section === 'grammar') {
      const grammarRatio = ranked.find((item) => item.section === 'grammar')?.ratio ?? 0
      return {
        id: 'smart-placement-focus',
        kind: 'placement',
        title: '定级主线 · 语法弱项',
        href: `/grammar-session?topic=${grammarTopicId}`,
        reason: `定级 ${placementResult.cefrLevel}：语法 ${Math.round(grammarRatio * 100)}% 正确率，按等级补练 ${grammarTopicId}。`,
      }
    }
    const readingRatio = ranked.find((item) => item.section === 'reading')?.ratio ?? 0
    return {
      id: 'smart-placement-focus',
      kind: 'placement',
      title: '定级主线 · 阅读/CE',
      href: '/tcf-reading',
      reason: `定级 ${placementResult.cefrLevel}：阅读 ${Math.round(readingRatio * 100)}% 正确率，插入 CE 模考节奏训练。`,
    }
  }

  const secondaryTask = (section) => {
    if (section === 'vocabulary') {
      return {
        id: 'smart-placement-secondary',
        kind: 'vocabulary',
        title: '定级加练 · 词汇',
        href: `/typing?dict=${rec.vocabularyDictIds[1] ?? primaryDictId}`,
        reason: '第二弱项为词汇，追加一组推荐词库分钟。',
      }
    }
    if (section === 'grammar') {
      return {
        id: 'smart-placement-secondary',
        kind: 'grammar',
        title: '定级加练 · 语法',
        href: `/grammar-session?topic=${grammarTopicId}`,
        reason: '第二弱项为语法，追加语法块。',
      }
    }
    if (placementResult.cefrLevel === 'A1' || placementResult.cefrLevel === 'A2') {
      return {
        id: 'smart-placement-secondary',
        kind: 'listening',
        title: '定级加练 · 听力 CO',
        href: '/tcf-listening',
        reason: '第二弱项为阅读/理解，用短听力补输入。',
      }
    }
    return {
      id: 'smart-placement-secondary',
      kind: 'reading',
      title: '定级加练 · 阅读 CE',
      href: '/tcf-reading',
      reason: '第二弱项为阅读理解，追加 CE 练习。',
    }
  }

  const tcfSkillBoost =
    placementResult.cefrLevel === 'B2' || placementResult.cefrLevel === 'B2+'
      ? { href: '/tcf', label: '四项模考轮转' }
      : placementResult.cefrLevel === 'B1'
        ? { href: '/tcf-writing', label: '写作 EE 自评' }
        : { href: '/tcf-listening', label: '听力 CO 入门' }

  return {
    cefrLevel: placementResult.cefrLevel,
    suggestedStartWeek: rec.suggestedStartWeek,
    studyPhaseId: rec.studyPhaseId,
    weakestSection: weakest,
    secondWeakestSection: secondWeakest,
    primaryDictId,
    grammarTopicId,
    focusTask: sectionTask(weakest),
    secondaryTask: secondaryTask(secondWeakest),
    tcfBoostHref: tcfSkillBoost.href,
    weightBias: {
      vocabulary: weakest === 'vocabulary' ? 8 : secondWeakest === 'vocabulary' ? 5 : 3,
      grammar: weakest === 'grammar' ? 8 : secondWeakest === 'grammar' ? 5 : 3,
      conjugation: 3,
    },
    focusMinutesRatio: 0.3,
    secondaryMinutesRatio: 0.15,
    vocabHref: `/typing?dict=${primaryDictId}`,
    grammarHref: `/grammar-session?topic=${grammarTopicId}`,
  }
}

export function buildPlacementRecommendations(cefrLevel) {
  const paths = {
    A1: {
      studyPhaseId: 1,
      suggestedStartWeek: 1,
      estimatedNclc: '约 NCLC 4（入门）',
      vocabularyDictIds: ['tcf-canada-foundation-01', 'tcf-a1-a2-people-routine'],
      grammarTopicIds: ['passe-compose-imparfait'],
      routes: [
        { href: '/typing?dict=tcf-canada-foundation-01', label: '基础核心词 01' },
        { href: '/grammar-session?topic=passe-compose-imparfait', label: 'Passé composé 句块' },
        { href: '/conjugation', label: '核心动词变位' },
      ],
      summaryZh:
        '当前更适合从 A1–A2 基础词汇与现在时、完成时入门开始。先建立每日跟打习惯，再逐步加入 30 分钟语法块与慢速听力。',
      teachingFocus: ['字母与重音输入', '高频动词 présent', '自我介绍与日常作息词汇'],
    },
    A2: {
      studyPhaseId: 1,
      suggestedStartWeek: 2,
      estimatedNclc: '约 NCLC 5',
      vocabularyDictIds: ['tcf-a1-a2-people-routine', 'tcf-canada-daily-life', 'tcf-grammar-passe-compose-core'],
      grammarTopicIds: ['passe-compose-imparfait'],
      routes: [
        { href: '/typing?dict=tcf-canada-daily-life', label: '日常生活主题' },
        { href: '/grammar-session?topic=passe-compose-imparfait', label: '完成时 vs 未完成过去时' },
        { href: '/tcf-listening', label: 'TCF 听力短练' },
      ],
      summaryZh:
        '已有 A2 底子：巩固日常生活场景词汇，重点区分 passé composé / imparfait，并开始接触 CO 短题找考试节奏。',
      teachingFocus: ['过去时叙事', '购物/交通/健康场景', '听一句懂大意'],
    },
    B1: {
      studyPhaseId: 2,
      suggestedStartWeek: 5,
      estimatedNclc: '约 NCLC 6，冲刺 7 需加强输出',
      vocabularyDictIds: ['tcf-canada-work-study-admin', 'tcf-canada-b1-connectors', 'tcf-b1-verbs-prepositions'],
      grammarTopicIds: ['passe-compose-imparfait', 'subjonctif-indicatif'],
      routes: [
        { href: '/typing?dict=tcf-canada-b1-connectors', label: 'B1 连接词' },
        { href: '/tcf-reading', label: 'TCF 阅读模考' },
        { href: '/tcf-writing', label: '写作三项自评' },
      ],
      summaryZh:
        '处于 B1 中段：用连接词与行政/工作词汇拉长句，阅读+写作并行；口语可先跟读再录 1 分钟自我介绍。',
      teachingFocus: ['因果/转折连接词', '行政与移民场景', '段落结构'],
    },
    B2: {
      studyPhaseId: 3,
      suggestedStartWeek: 9,
      estimatedNclc: '约 NCLC 7–8 区间（训练估算）',
      vocabularyDictIds: ['tcf-canada-b2-opinion', 'tcf-b2-abstract-nouns', 'tcf-b2-collocations'],
      grammarTopicIds: ['subjonctif-indicatif', 'pronoms-relatifs'],
      routes: [
        { href: '/typing?dict=tcf-canada-b2-opinion', label: 'B2 观点表达' },
        { href: '/tcf', label: '四项模考总览' },
        { href: '/analysis', label: '弱项数据分析' },
      ],
      summaryZh:
        'B2 水平：以观点表达与抽象名词搭配为主，四项模考轮流刷，用统计页盯住最弱技能。',
      teachingFocus: ['论证与反驳', '抽象话题词汇', '计时完整模考'],
    },
    'B2+': {
      studyPhaseId: 4,
      suggestedStartWeek: 13,
      estimatedNclc: 'NCLC 8+ 潜力，以稳定与节奏为主',
      vocabularyDictIds: ['tcf-canada-oral-writing', 'tcf-writing-formal', 'tcf-oral-questions'],
      grammarTopicIds: ['hypothese-si', 'pronoms-relatifs'],
      routes: [
        { href: '/tcf-speaking', label: '口语 EO 模考' },
        { href: '/tcf-writing', label: '写作 EE 模考' },
        { href: '/study-plan', label: '按 26 周冲刺排期' },
      ],
      summaryZh:
        '综合题表现已接近 B2 高位：减少新词库，增加全真计时与错题复盘，对准 NCLC 7 四项达标线。',
      teachingFocus: ['考试节奏', '弱项重复', '输出稳定性'],
    },
  }
  return paths[cefrLevel] ?? paths.A1
}

export function computePlacementResult({
  answers,
  durationSeconds,
  startedAt,
  finishedAt,
  id,
  day,
}) {
  if (!Array.isArray(answers) || answers.length === 0) throw new Error('Invalid placement answers')
  const sectionScores = {}
  const levelScores = { A1: bucket(), A2: bucket(), B1: bucket(), B2: bucket() }
  const normalizedAnswers = []

  for (const entry of answers) {
    if (!entry || typeof entry.questionId !== 'string') throw new Error('Invalid placement answer')
    const question = QUESTION_BY_ID.get(entry.questionId)
    if (!question) throw new Error('Unknown placement question')
    const choiceIndex = entry.choiceIndex
    if (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex >= question.choices.length)
      throw new Error('Invalid placement choice')
    const correct = choiceIndex === question.correctIndex
    addScore(sectionScores, question.section, correct)
    addScore(levelScores, question.level, correct)
    normalizedAnswers.push({
      questionId: entry.questionId,
      choiceIndex,
      correct,
    })
  }

  const cefrLevel = deriveCefrLevel(levelScores)
  const recommendations = buildPlacementRecommendations(cefrLevel)

  return {
    id: id ?? crypto.randomUUID(),
    finishedAt,
    startedAt,
    day,
    durationSeconds,
    cefrLevel,
    sectionScores,
    levelScores,
    answers: normalizedAnswers,
    recommendations,
    questionCount: PLACEMENT_QUESTIONS.length,
    version: 1,
  }
}

export function validatePlacementResult(value) {
  if (!value || typeof value !== 'object') throw new Error('Invalid placement result')
  if (typeof value.id !== 'string' || !/^[a-f0-9-]{36}$/.test(value.id)) throw new Error('Invalid placement id')
  if (!RESULT_LEVELS.includes(value.cefrLevel)) throw new Error('Invalid placement level')
  if (!Number.isInteger(value.finishedAt) || !Number.isInteger(value.startedAt) || value.finishedAt < value.startedAt)
    throw new Error('Invalid placement timestamps')
  if (!Number.isInteger(value.durationSeconds) || value.durationSeconds < 0 || value.durationSeconds > 7200)
    throw new Error('Invalid placement duration')
  if (typeof value.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.day)) throw new Error('Invalid placement day')
  if (!Array.isArray(value.answers) || value.answers.length === 0 || value.answers.length > PLACEMENT_QUESTIONS.length)
    throw new Error('Invalid placement answers')
  const recomputed = computePlacementResult({
    answers: value.answers,
    durationSeconds: value.durationSeconds,
    startedAt: value.startedAt,
    finishedAt: value.finishedAt,
    id: value.id,
    day: value.day,
  })
  if (recomputed.cefrLevel !== value.cefrLevel) throw new Error('Placement level mismatch')
  if (value.questionCount !== PLACEMENT_QUESTIONS.length) throw new Error('Invalid placement question count')
  if (value.version !== 1) throw new Error('Invalid placement version')
  if (!value.recommendations || typeof value.recommendations !== 'object') throw new Error('Invalid placement recommendations')
  if (!Number.isInteger(value.recommendations.studyPhaseId)) throw new Error('Invalid placement recommendations')
}

export function mergePlacementHistory(current, incoming) {
  const seen = new Set((current ?? []).map((item) => item.id))
  const merged = [...(current ?? [])]
  validatePlacementResult(incoming)
  if (!seen.has(incoming.id)) merged.push(structuredClone(incoming))
  merged.sort((a, b) => a.finishedAt - b.finishedAt || a.id.localeCompare(b.id))
  return merged.slice(-MAX_PLACEMENT_HISTORY)
}

export function placementSectionLabel(section) {
  return sectionLabel[section] ?? section
}

export { CEFR_LEVELS, RESULT_LEVELS }
