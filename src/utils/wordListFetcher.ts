import { CUSTOM_DICT_URL_PREFIX, loadCustomDictWords } from '@/store/customDict'
import type { Word } from '@/typings'
import { practiceListUrl } from '@/utils/studyListMaintenance.mjs'

export async function wordListFetcher(url: string): Promise<Word[]> {
  if (url.startsWith(CUSTOM_DICT_URL_PREFIX)) return loadCustomDictWords(url)

  const prefix = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''
  const requestUrl = practiceListUrl(url, LATEST_COMMIT_HASH, prefix)

  const response = await fetch(requestUrl)

  if (!response.ok) {
    throw new Error(`词库加载失败：${response.status} ${response.statusText} (${requestUrl})`)
  }

  const words: unknown = await response.json()
  if (!Array.isArray(words) || words.some((word) => !word || typeof word.name !== 'string' || !word.name.trim())) {
    throw new Error('词库内容格式无效，请重试或选择其他词库。')
  }
  if (words.length === 0) throw new Error('词库没有可练习的词条，请重试或选择其他词库。')
  return words as Word[]
}
