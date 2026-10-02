import type { Word } from '@/typings'

export async function wordListFetcher(url: string): Promise<Word[]> {
  const prefix = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''
  const cleanPath = url.replace(/^\.\//, '').replace(/^\//, '')
  const requestUrl = `${prefix}/${cleanPath}`

  const response = await fetch(requestUrl)

  if (!response.ok) {
    throw new Error(`词库加载失败：${response.status} ${response.statusText} (${requestUrl})`)
  }

  return (await response.json()) as Word[]
}
