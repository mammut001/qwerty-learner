// The list is curated by the owner; only add videos whose embedding is allowed.
// 该列表由维护者精选，仅收录官方允许嵌入播放的公开法语视频。

export type VideoAccent = 'Québec' | 'Canada' | 'France'
export type VideoLevel = 'B1' | 'B2'
export type VideoCaptionType = 'human' | 'auto'

export interface VideoLesson {
  id: string
  youtubeId: string
  title: string
  titleFr: string
  channel: string
  accent: VideoAccent
  level: VideoLevel
  durationLabel: string
  captions: VideoCaptionType
  start?: number
  end?: number
  topics: string[]
  notes?: string
}

export const VIDEO_LESSONS: VideoLesson[] = [
  {
    id: 'rc-francisation-etudiants',
    youtubeId: '5qgZSMF85H0',
    title: '魁北克法语班学员分享生活与融入经历',
    titleFr: 'Des étudiants en francisation témoignent de leur parcours',
    channel: 'Radio-Canada Info',
    accent: 'Québec',
    level: 'B1',
    durationLabel: '3:04',
    captions: 'human',
    topics: ['移民融入', '法语学习', '魁北克生活'],
    notes: '来自不同背景的学员讲述在魁北克的生活与语言适应，语速清晰平稳，适合 B1 听力入门。',
  },
  {
    id: 'rc-trudeau-insecurite-francais',
    youtubeId: 'VqBo7-dtLJA',
    title: '特鲁多谈个人成长与法语不安全感',
    titleFr: "Justin Trudeau et l'insécurité en français",
    channel: 'Radio-Canada Info',
    accent: 'Québec',
    level: 'B2',
    durationLabel: '4:53',
    captions: 'human',
    topics: ['双语挑战', '加拿大社会', '语言认同'],
    notes: '深度访谈形式，探讨加拿大双语环境与个人语言体验，用词地道自然，包含典型魁北克法语语音语调。',
  },
  {
    id: 'rc-trudeau-adieux-liberaux',
    youtubeId: 'kcTXFgGwTek',
    title: '特鲁多向自由党基层发表法语告别讲话',
    titleFr: "Discours d'adieu de Justin Trudeau aux militants libéraux",
    channel: 'Radio-Canada Info',
    accent: 'Canada',
    level: 'B2',
    durationLabel: '14:02',
    captions: 'human',
    topics: ['公众演说', '联邦政治', '执政回顾'],
    notes: '正式公众演说语体，语调严谨且感染力强，长句较多，适合练习抓取宏观论点与篇章逻辑。',
  },
  {
    id: 'rc-legault-point-de-presse',
    youtubeId: 'lrq9I857wiw',
    title: '魁北克省长弗朗索瓦·勒戈记者会声明（前 4 分钟）',
    titleFr: 'Point de presse de François Legault',
    channel: 'Radio-Canada Info',
    accent: 'Québec',
    level: 'B2',
    durationLabel: '4:00',
    start: 0,
    end: 240,
    captions: 'human',
    topics: ['时事新闻', '魁北克省政', '官方讲话'],
    notes: '节选记者会前 4 分钟开场陈述，纯正魁北克官方发音与政务用词，语速紧凑。',
  },
  {
    id: 'cpac-trudeau-noel-2024',
    youtubeId: 'ItIoEa7vZ0o',
    title: '加拿大总理 2024 年圣诞节日法语致辞',
    titleFr: 'Message de Noël 2024 du premier ministre Justin Trudeau',
    channel: 'CPAC',
    accent: 'Canada',
    level: 'B1',
    durationLabel: '1:56',
    captions: 'auto',
    topics: ['节日祝词', '家庭生活', '社会关怀'],
    notes: '节奏舒缓，发音吐字清晰规范，内容贴近日常祝福与温情关怀，适合短篇精听复读。',
  },
  {
    id: 'pm-canada-francophonie',
    youtubeId: 'bBU7jsSWS8Y',
    title: '加拿大总理在法语国家组织峰会发表讲话',
    titleFr: 'Allocution du premier ministre au Sommet de la Francophonie',
    channel: 'PM Canada Archives',
    accent: 'Canada',
    level: 'B1',
    durationLabel: '4:12',
    captions: 'auto',
    topics: ['国际交流', '法语国家组织', '多边合作'],
    notes: '国际多边会议开场致辞，国际法语规范标准，语速适中，适合练习正式外交场合表达。',
  },
  {
    id: 'macron-adresse-francais',
    youtubeId: 'mkhJuB8-s14',
    title: '法国总统马克龙就国家重大事项发表电视讲话',
    titleFr: 'Adresse aux Français par le président Emmanuel Macron',
    channel: 'Emmanuel Macron',
    accent: 'France',
    level: 'B2',
    durationLabel: '12:18',
    captions: 'human',
    topics: ['国情通报', '法国政治', '国家政策'],
    notes: '标准本土法国官方电视讲话，文风严谨，句型层次丰富，是练习高阶 B2 听力的优质素材。',
  },
  {
    id: 'france24-macron-adresse',
    youtubeId: 'jQtnrqEVe1A',
    title: '法国24台：总统重要讲话电视直播回顾',
    titleFr: "FRANCE 24 — Replay de l'adresse aux Français du président",
    channel: 'FRANCE 24',
    accent: 'France',
    level: 'B2',
    durationLabel: '7:43',
    captions: 'auto',
    topics: ['新闻播报', '国际时事', '演说实录'],
    notes: '主流国际新闻频道报道与现场讲话切片，包含播音员导语与现场原声，有助于适应不同声音环境。',
  },
]
