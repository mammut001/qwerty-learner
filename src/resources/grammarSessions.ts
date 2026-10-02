export type GrammarScenarioOption = {
  label: 'A' | 'B'
  text: string
}

export type GrammarScenario = {
  id: number
  prompt: string
  options: [GrammarScenarioOption, GrammarScenarioOption]
  correct: 'A' | 'B'
  explanation: string
  translation: string
  vocabulary?: string[]
  signal?: string
}

export const passeComposeVsImparfaitScenarios: GrammarScenario[] = [
  {
    id: 1,
    prompt: "Hier soir, je ___ un film quand mon ami m’___.",
    options: [
      { label: 'A', text: 'regardais / a appelé' },
      { label: 'B', text: 'ai regardé / appelait' },
    ],
    correct: 'A',
    explanation:
      "regardais 是当时正在进行的背景动作；a appelé 是突然发生并完成的新事件。可以把它理解成：背景用 imparfait，打断背景的事件用 passé composé。",
    translation: "昨晚我正在看电影的时候，我朋友给我打了电话。",
    vocabulary: ['regarder = 看', 'appeler = 打电话；叫'],
    signal: 'quand + 正在进行的背景 + 突发事件',
  },
  {
    id: 2,
    prompt: "Quand j’étais étudiant, je ___ souvent à la bibliothèque.",
    options: [
      { label: 'A', text: 'travaillais' },
      { label: 'B', text: 'ai travaillé' },
    ],
    correct: 'A',
    explanation:
      "Quand j’étais étudiant 描述过去的一段时期，souvent 表示过去反复发生的习惯，所以用 imparfait。",
    translation: "我当学生的时候，经常在图书馆学习/工作。",
    vocabulary: ['souvent = 经常', 'bibliothèque = 图书馆'],
    signal: 'souvent / quand j’étais... → 过去习惯',
  },
  {
    id: 3,
    prompt: "Il ___ très froid, alors nous ___ un taxi.",
    options: [
      { label: 'A', text: 'faisait / avons pris' },
      { label: 'B', text: 'a fait / prenions' },
    ],
    correct: 'A',
    explanation:
      "天气状态 faisait froid 是背景；prendre un taxi 是随后发生并完成的动作，所以用 avons pris。",
    translation: "当时很冷，所以我们坐了出租车。",
    vocabulary: ['faire froid = 天冷', 'prendre un taxi = 坐出租车'],
    signal: '天气/状态背景 → imparfait；发生的动作 → passé composé',
  },
  {
    id: 4,
    prompt: "Je ___ dans la rue quand je ___ mon ancien professeur.",
    options: [
      { label: 'A', text: 'marchais / ai vu' },
      { label: 'B', text: 'ai marché / voyais' },
    ],
    correct: 'A',
    explanation:
      "marchais 表示当时正在街上走，是背景；ai vu 表示我看见老师这个事件发生了，是完成事件。",
    translation: "我正在街上走的时候，看到了我以前的老师。",
    vocabulary: ['marcher = 走路', 'ancien professeur = 以前的老师'],
    signal: '进行中的背景 + 突然看到/听到/遇到',
  },
  {
    id: 5,
    prompt: "Tous les étés, nous ___ chez mes grands-parents.",
    options: [
      { label: 'A', text: 'allions' },
      { label: 'B', text: 'sommes allés' },
    ],
    correct: 'A',
    explanation:
      "Tous les étés 表示“每年夏天”，是过去反复发生的习惯，所以用 imparfait：allions。",
    translation: "以前每年夏天我们都会去祖父母家。",
    vocabulary: ['tous les étés = 每年夏天', 'grands-parents = 祖父母'],
    signal: 'tous les... → 过去反复习惯',
  },
  {
    id: 6,
    prompt: "Samedi dernier, nous ___ chez mes grands-parents.",
    options: [
      { label: 'A', text: 'allions' },
      { label: 'B', text: 'sommes allés' },
    ],
    correct: 'B',
    explanation:
      "Samedi dernier 指一个明确的过去时间点，是一次发生并完成的事件，所以用 passé composé：sommes allés。",
    translation: "上周六我们去了祖父母家。",
    vocabulary: ['samedi dernier = 上周六'],
    signal: '明确的一次过去时间 → passé composé',
  },
  {
    id: 7,
    prompt: "Elle ___ quand soudain elle ___ un bruit étrange.",
    options: [
      { label: 'A', text: 'dormait / a entendu' },
      { label: 'B', text: 'a dormi / entendait' },
    ],
    correct: 'A',
    explanation:
      "dormait 是正在持续的背景；soudain 明确提示一个突然发生的新事件，因此用 a entendu。",
    translation: "她正在睡觉时，突然听到了一个奇怪的声音。",
    vocabulary: ['soudain = 突然', 'un bruit étrange = 一个奇怪的声音'],
    signal: 'soudain → 常提示 passé composé',
  },
  {
    id: 8,
    prompt: "Avant, Marc ___ beaucoup, mais l’année dernière il ___ de fumer.",
    options: [
      { label: 'A', text: 'fumait / a arrêté' },
      { label: 'B', text: 'a fumé / arrêtait' },
    ],
    correct: 'A',
    explanation:
      "Avant 描述过去长期习惯，所以 fumait；l’année dernière 发生了“戒烟”这个改变并完成，所以 a arrêté。",
    translation: "以前 Marc 抽很多烟，但去年他戒烟了。",
    vocabulary: ['avant = 以前', 'arrêter de fumer = 戒烟'],
    signal: '以前的习惯 + 后来发生的改变',
  },
  {
    id: 9,
    prompt: "Quand je suis entré dans la cuisine, ma mère ___ le dîner.",
    options: [
      { label: 'A', text: 'préparait' },
      { label: 'B', text: 'a préparé' },
    ],
    correct: 'A',
    explanation:
      "我走进厨房是一个完成事件；那一刻妈妈正在做饭，所以 préparait 用 imparfait 描述当时正在进行的背景。",
    translation: "当我走进厨房的时候，我妈正在准备晚饭。",
    vocabulary: ['entrer = 进入', 'préparer le dîner = 准备晚饭'],
    signal: '一个事件发生时，另一个动作正在进行',
  },
  {
    id: 10,
    prompt: "Hier, ma mère ___ le dîner à 18h, puis nous ___ ensemble.",
    options: [
      { label: 'A', text: 'préparait / mangions' },
      { label: 'B', text: 'a préparé / avons mangé' },
    ],
    correct: 'B',
    explanation:
      "这里是在按顺序讲昨天发生的两件完整事件：先准备晚饭，然后一起吃饭，所以两个动作都用 passé composé。",
    translation: "昨天我妈 18 点准备了晚饭，然后我们一起吃了饭。",
    vocabulary: ['puis = 然后', 'manger = 吃'],
    signal: '按顺序叙述一连串完成事件 → passé composé',
  },
]

export const grammarBatches = [
  { title: '第 1 组 · 建立背景 / 事件感觉', questionIds: [1, 2, 3, 4] },
  { title: '第 2 组 · 时间词与习惯', questionIds: [5, 6, 7, 8] },
  { title: '第 3 组 · 综合判断', questionIds: [9, 10] },
]
