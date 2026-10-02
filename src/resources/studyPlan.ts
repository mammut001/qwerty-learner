export type StudyTaskKind =
  | 'grammar'
  | 'listening'
  | 'vocabulary'
  | 'reading'
  | 'writing'
  | 'speaking'
  | 'pronunciation'
  | 'tcf'
  | 'review'

export type StudyTask = {
  id: string
  title: string
  minutes: number
  kind: StudyTaskKind
  description: string
  href?: string
  actionLabel?: string
}

export type DayPlan = {
  weekday: number
  name: string
  totalLabel: string
  note?: string
  tasks: StudyTask[]
}

export type StudyPhase = {
  id: number
  weeks: [number, number]
  name: string
  goal: string
  state: string
  focus: string[]
}

export const studyPhases: StudyPhase[] = [
  {
    id: 1,
    weeks: [1, 4],
    name: '捡回基础',
    goal: 'A2/B1 语法恢复，重新开口',
    state: '重新建立时态、核心动词、基础听力和主动输出。',
    focus: ['Passé composé / imparfait', '核心动词变位', 'A1-A2 / B1 高频词'],
  },
  {
    id: 2,
    weeks: [5, 8],
    name: '站稳 B1',
    goal: '能听懂日常材料大意，写简单完整文章',
    state: '减少基础语法卡顿，把阅读、听力和短写作连起来。',
    focus: ['B1 连接词', '日常听力', '短文写作与复述'],
  },
  {
    id: 3,
    weeks: [9, 12],
    name: 'B1 → B2',
    goal: '开始稳定表达观点、比较与论证',
    state: '从“说清楚”推进到“有结构地表达观点”。',
    focus: ['B2 观点表达', '抽象名词', '论证搭配'],
  },
  {
    id: 4,
    weeks: [13, 16],
    name: 'TCF 专项化',
    goal: '熟悉所有题型，不再只是“学法语”',
    state: '训练开始围绕 TCF Canada 题型、时间限制和输出要求组织。',
    focus: ['TCF 口语任务', '正式写作', '题型节奏'],
  },
  {
    id: 5,
    weeks: [17, 21],
    name: '大量计时训练',
    goal: '找到听说读写最弱的 1–2 项并重点补',
    state: '减少新内容，增加计时训练、错题分析和弱项重复。',
    focus: ['计时', '错题分析', '弱项专项'],
  },
  {
    id: 6,
    weeks: [22, 26],
    name: '模拟考试冲刺',
    goal: '稳定达到 B2 / NCLC 7 附近或以上',
    state: '以完整模拟、节奏控制和稳定输出为主。',
    focus: ['全真模拟', '考试节奏', '稳定性'],
  },
]

export const weeklyStudyPlan: DayPlan[] = [
  {
    weekday: 1,
    name: '周一',
    totalLabel: '80–90 min',
    tasks: [
      {
        id: 'mon-grammar',
        title: '语法恢复',
        minutes: 30,
        kind: 'grammar',
        description: 'Passé composé vs imparfait：先判断，再解释为什么。',
        href: '/grammar-session',
        actionLabel: '开始语法训练',
      },
      {
        id: 'mon-listening',
        title: '听力',
        minutes: 30,
        kind: 'listening',
        description: '听一段可理解材料，先抓大意，再回听细节。',
      },
      {
        id: 'mon-vocab',
        title: '单词 / 表达',
        minutes: 20,
        kind: 'vocabulary',
        description: '练当前阶段词库，不追求一次背很多。',
        href: '/gallery',
        actionLabel: '打开词库',
      },
    ],
  },
  {
    weekday: 2,
    name: '周二',
    totalLabel: '80–90 min',
    tasks: [
      {
        id: 'tue-reading',
        title: '阅读',
        minutes: 35,
        kind: 'reading',
        description: '限时读一篇材料，标出主题、观点和连接词。',
      },
      {
        id: 'tue-writing',
        title: '写作',
        minutes: 40,
        kind: 'writing',
        description: '完成一个短写作任务，优先保证结构完整。',
      },
      {
        id: 'tue-correction',
        title: '改错',
        minutes: 15,
        kind: 'review',
        description: '只改今天最影响表达的错误，不无限润色。',
      },
    ],
  },
  {
    weekday: 3,
    name: '周三',
    totalLabel: '80–90 min',
    tasks: [
      {
        id: 'wed-listening',
        title: '听力',
        minutes: 30,
        kind: 'listening',
        description: '听完后不用中文逐句翻译，先复述大意。',
      },
      {
        id: 'wed-speaking',
        title: '口语',
        minutes: 40,
        kind: 'speaking',
        description: '围绕一个话题连续说，重点是完整表达而不是零错误。',
      },
      {
        id: 'wed-pronunciation',
        title: '发音 / 跟读',
        minutes: 15,
        kind: 'pronunciation',
        description: '选短材料做 shadowing，关注节奏和连读。',
        href: '/conjugation',
        actionLabel: '顺便练核心动词',
      },
    ],
  },
  {
    weekday: 4,
    name: '周四',
    totalLabel: '90 min',
    tasks: [
      {
        id: 'thu-tcf',
        title: 'TCF 专项计时训练',
        minutes: 60,
        kind: 'tcf',
        description: '严格计时完成一组 TCF Canada 专项，不边做边查。',
      },
      {
        id: 'thu-review',
        title: '错题分析',
        minutes: 30,
        kind: 'review',
        description: '区分：不会、看错、时间不够、词汇不认识。',
      },
    ],
  },
  {
    weekday: 5,
    name: '周五',
    totalLabel: '15–25 min',
    note: '搬砖日：够轻就行。',
    tasks: [
      {
        id: 'fri-vocab',
        title: '单词',
        minutes: 10,
        kind: 'vocabulary',
        description: '只练一小章或复习旧词。',
        href: '/gallery',
        actionLabel: '打开词库',
      },
      {
        id: 'fri-listening',
        title: '法语听力',
        minutes: 10,
        kind: 'listening',
        description: '通勤或休息时听短材料，不要求做笔记。',
      },
    ],
  },
  {
    weekday: 6,
    name: '周六',
    totalLabel: '20–30 min',
    tasks: [
      {
        id: 'sat-listening',
        title: '听一个材料',
        minutes: 15,
        kind: 'listening',
        description: '完整听一遍，抓住人物、主题、发生了什么。',
      },
      {
        id: 'sat-retell',
        title: '法语口头复述',
        minutes: 10,
        kind: 'speaking',
        description: '用法语连续复述 2–3 分钟，不查词也先说完。',
      },
    ],
  },
  {
    weekday: 0,
    name: '周日',
    totalLabel: '20–30 min',
    note: '复习本周错误，不学大量新东西。',
    tasks: [
      {
        id: 'sun-review',
        title: '复习本周错误',
        minutes: 25,
        kind: 'review',
        description: '回看本周反复错的词、时态和表达，挑最重要的重新做。',
      },
    ],
  },
]

export const minimumModeTasks: StudyTask[] = [
  {
    id: 'minimum-vocab',
    title: '最低模式 · 单词',
    minutes: 5,
    kind: 'vocabulary',
    description: '只练 5 分钟旧词，目标是不断线。',
    href: '/gallery',
    actionLabel: '练 5 分钟',
  },
  {
    id: 'minimum-listening',
    title: '最低模式 · 听力',
    minutes: 5,
    kind: 'listening',
    description: '听 5 分钟法语，不要求记笔记。',
  },
]

export function getStudyPhase(week: number): StudyPhase {
  return studyPhases.find((phase) => week >= phase.weeks[0] && week <= phase.weeks[1]) ?? studyPhases[studyPhases.length - 1]
}

export function getDayPlan(weekday: number): DayPlan {
  return weeklyStudyPlan.find((day) => day.weekday === weekday) ?? weeklyStudyPlan[0]
}
