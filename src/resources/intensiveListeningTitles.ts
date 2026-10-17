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
    title: '在魁北克租公寓打电话',
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
]
