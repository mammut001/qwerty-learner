export interface IntensiveListeningTitle {
  id: string
  title: string
  level: 'B1' | 'B2'
}

export const INTENSIVE_TITLES: IntensiveListeningTitle[] = [
  {
    id: 'premier-jour-cours-francais',
    title: '第一天上法语课',
    level: 'B1',
  },
  {
    id: 'appel-location-appartement',
    title: '在蒙特利尔租公寓打电话',
    level: 'B1',
  },
  {
    id: 'preparer-hiver-quebec',
    title: '冬天准备清单',
    level: 'B1',
  },
  {
    id: 'entrevue-embauche-montreal',
    title: '求职面试',
    level: 'B2',
  },
  {
    id: 'radio-communautaire-integration',
    title: '社区电台：移民融入经验',
    level: 'B2',
  },
  {
    id: 'debat-teletravail-hybride',
    title: '关于远程办公的讨论',
    level: 'B2',
  },
  {
    id: 'pharmacie-conseils-symptomes',
    title: '在药房问药与症状',
    level: 'B1',
  },
  {
    id: 'astuces-transport-stm-montreal',
    title: '坐 STM 地铁与公交的小技巧',
    level: 'B1',
  },
  {
    id: 'appel-saaq-echange-permis',
    title: '预约 SAAQ 驾照换领',
    level: 'B1',
  },
  {
    id: 'conference-francais-quebecois-france',
    title: '魁北克法语与法国法语的差异',
    level: 'B2',
  },
  {
    id: 'litige-logement-mediation-tal',
    title: '租房纠纷与 TAL 调解',
    level: 'B2',
  },
  {
    id: 'podcast-benevolat-tremplin-emploi',
    title: '志愿者经历如何帮助求职',
    level: 'B2',
  },
]
