import { useEffect } from 'react'

const DEFAULT_TITLE = document.title
const SITE_SUFFIX = 'TCF Canada 法语｜Qwerty Français'

// Public pages that get their own document title; everything else keeps the default.
const PAGE_TITLES: Array<[RegExp, string]> = [
  [/^\/typing\/?$/, '打字背词'],
  [/^\/(tap)\/?$/, '点选模式·手机背法语单词'],
  [/^\/gallery\/?$/, '词汇图库'],
  [/^\/dictionary\/?$/, '法语词典'],
  [/^\/word-lists\/?$/, '自定义词表'],
  [/^\/conjugation\/?$/, '动词变位'],
  [/^\/grammar-session\/?$/, '语法练习'],
  [/^\/tenses(\/.*)?$/, '法语时态'],
  [/^\/recalls\/?$/, 'TCF 真题回忆'],
  [/^\/tcf-listening\/?$/, 'TCF 听力练习'],
  [/^\/tcf-reading\/?$/, 'TCF 阅读练习'],
]

export function titleForPath(pathname: string): string {
  const match = PAGE_TITLES.find(([pattern]) => pattern.test(pathname))
  return match ? `${match[1]} — ${SITE_SUFFIX}` : DEFAULT_TITLE
}

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}
