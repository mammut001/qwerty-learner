import { type DictionaryResult, type DictionaryWord, GENDER_LABELS, POS_LABELS, briefMeaning, speakFrench } from '@/services/dictionary'
import { type OnlineChineseSource, loadOnlineChinese, needsOnlineChinese } from '@/services/dictionaryOnline'
import { type YoudaoFrench, loadYoudaoFrench, youdaoQuery } from '@/services/dictionaryYoudao'
import { CUSTOM_DICT_LIMITS, type CustomDict, customDictsAtom } from '@/store/customDict'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import IconVolume from '~icons/tabler/volume'

const LAST_LIST_KEY = 'qwerty-fr-dictionary-last-list'
const DEFAULT_LIST_NAME = '生词本'

function AddToWordList({ word, meaning }: { word: string; meaning: string }) {
  const [lists, setLists] = useAtom(customDictsAtom)
  const [listId, setListId] = useState(() => {
    try {
      return window.localStorage.getItem(LAST_LIST_KEY) ?? ''
    } catch {
      return ''
    }
  })
  const [message, setMessage] = useState('')
  const target = lists.find((item) => item.id === listId) ?? lists[0]
  const alreadySaved = Boolean(target?.words.some((item) => item.name === word))

  useEffect(() => setMessage(''), [word])

  const add = () => {
    const now = Date.now()
    const entry = { name: word, trans: meaning ? [meaning.slice(0, CUSTOM_DICT_LIMITS.trans)] : [] }
    try {
      if (!target) {
        const created: CustomDict = {
          id: `custom-${crypto.randomUUID().slice(0, 8)}`,
          name: DEFAULT_LIST_NAME,
          description: '查词时收藏的生词',
          words: [entry],
          createdAt: now,
          updatedAt: now,
        }
        setLists([created, ...lists])
        setMessage(`已新建「${DEFAULT_LIST_NAME}」并加入`)
        return
      }
      if (target.words.length >= CUSTOM_DICT_LIMITS.words) {
        setMessage('这个词表已满')
        return
      }
      setLists(lists.map((item) => (item.id === target.id ? { ...item, words: [...item.words, entry], updatedAt: now } : item)))
      setMessage(`已加入「${target.name}」`)
    } catch {
      setMessage('保存失败：浏览器存储不可用')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {lists.length > 1 && (
        <select
          value={target?.id ?? ''}
          aria-label="选择词表"
          onChange={(event) => {
            setListId(event.target.value)
            try {
              window.localStorage.setItem(LAST_LIST_KEY, event.target.value)
            } catch {
              // Remembering the list is optional.
            }
          }}
          className="max-w-[10rem] rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        >
          {lists.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        data-testid="dictionary-add"
        disabled={alreadySaved}
        onClick={add}
        className="rounded-lg bg-indigo-500 px-3 py-1.5 font-medium text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600"
      >
        {alreadySaved
          ? '已在词表中'
          : lists.length === 0
          ? `＋ 加入${DEFAULT_LIST_NAME}`
          : lists.length === 1
          ? `＋ 加入「${target?.name}」`
          : '＋ 加入'}
      </button>
      {message && (
        <span role="status" className="text-xs text-green-600 dark:text-green-400">
          {message}
        </span>
      )}
    </div>
  )
}

const YOUDAO_POS: Record<string, string> = {
  'm.': '阳性名词',
  'n.m.': '阳性名词',
  'f.': '阴性名词',
  'n.f.': '阴性名词',
  'v.t.': '及物动词',
  'v.i.': '不及物动词',
  'v.pr.': '代词式动词',
  'v.': '动词',
  'adj.': '形容词',
  'adv.': '副词',
  'prép.': '介词',
  'prep.': '介词',
  'conj.': '连词',
  'interj.': '感叹词',
  'loc.': '短语',
}

function YoudaoBlock({ entry, compact }: { entry: YoudaoFrench; compact: boolean }) {
  if (entry.senses.length === 0 && entry.examples.length === 0) return null
  const examples = entry.examples.slice(0, compact ? 1 : 2)
  return (
    <div data-testid="dictionary-youdao" className="mt-3 border-l-2 border-indigo-400 pl-3">
      <div className="text-xs font-semibold text-indigo-500">
        {entry.senses.length > 0 ? `有道 · ${entry.source || '法汉词典'}` : '有道例句'}
      </div>
      {entry.senses.length > 0 && (
        <div className="mt-1 space-y-1.5">
          {entry.senses.map((sense) => (
            <div key={`${sense.pos}-${sense.gloss}`} className="text-base leading-7 text-gray-950 dark:text-gray-100">
              {sense.pos && (
                <span className="mr-2 rounded bg-indigo-50 px-1.5 py-0.5 align-middle text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                  {YOUDAO_POS[sense.pos] ?? sense.pos}
                </span>
              )}
              {sense.gloss}
            </div>
          ))}
        </div>
      )}
      {examples.length > 0 && (
        <div className="mt-2 space-y-2">
          {examples.map((example) => (
            <div key={example.fr}>
              <div lang="fr" className="text-sm leading-6 text-gray-800 dark:text-gray-200">
                {example.fr}
              </div>
              <div className="text-sm leading-6 text-gray-500 dark:text-gray-400">{example.zh}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function OnlineMeanings({ meanings, source, compact }: { meanings: string[]; source: OnlineChineseSource; compact: boolean }) {
  if (meanings.length === 0) return null
  const label = source === 'fr-wiktionary' ? '法语维基词典译表 · 在线' : '中文维基词典 · 在线'
  return (
    <div
      data-testid="dictionary-online"
      className="mt-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200"
    >
      {compact ? (
        <>
          <span className="mr-2 text-xs font-semibold text-indigo-500">{label}</span>
          {meanings.join('；')}
        </>
      ) : (
        <>
          <div className="text-xs font-semibold text-indigo-500">{label}</div>
          <ol className="mt-1 list-inside list-decimal space-y-0.5 text-sm leading-6">
            {meanings.map((meaning) => (
              <li key={meaning}>{meaning}</li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}

function WordBlock({
  item,
  compact,
  onlineMeanings = [],
  onlineSource,
  youdao = null,
}: {
  item: DictionaryWord
  compact: boolean
  onlineMeanings?: string[]
  onlineSource: OnlineChineseSource
  youdao?: YoudaoFrench | null
}) {
  const ipa = item.entries.find((entry) => entry.ipa)?.ipa
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={`${compact ? 'text-xl' : 'text-3xl'} font-semibold text-gray-950 dark:text-white`} lang="fr">
          {item.word}
        </span>
        {ipa && <span className="font-mono text-sm text-gray-500 dark:text-gray-400">{ipa}</span>}
        <button
          type="button"
          onClick={() => speakFrench(item.word)}
          aria-label={`朗读 ${item.word}`}
          className="rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-700"
        >
          <IconVolume className="h-5 w-5" />
        </button>
      </div>

      {youdao && <YoudaoBlock entry={youdao} compact={compact} />}

      <OnlineMeanings meanings={onlineMeanings} source={onlineSource} compact={compact} />

      {item.site.length > 0 && (
        <div className="mt-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200">
          <span className="mr-2 text-xs font-semibold text-indigo-500">本站词库</span>
          {item.site.join('；')}
        </div>
      )}

      {!youdao?.senses.length && (
        <div className={`mt-3 ${compact ? 'space-y-2' : 'space-y-4'}`}>
          {item.entries.slice(0, compact ? 3 : undefined).map((entry, index) => (
            <div key={`${entry.pos}-${index}`}>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-700">{POS_LABELS[entry.pos] ?? entry.pos}</span>
                {entry.gender && <span>{GENDER_LABELS[entry.gender]}</span>}
              </div>
              {entry.zh.length > 0 && (
                <ol className="mt-1.5 list-inside list-decimal space-y-0.5 text-sm leading-6 text-gray-900 dark:text-gray-100">
                  {entry.zh.slice(0, compact ? 3 : undefined).map((gloss) => (
                    <li key={gloss}>{gloss}</li>
                  ))}
                </ol>
              )}
              <ol
                className={`mt-1.5 list-inside list-decimal space-y-0.5 text-sm leading-6 ${
                  entry.zh.length > 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
                }`}
                lang="en"
              >
                {entry.en.slice(0, compact ? (entry.zh.length > 0 ? 1 : 3) : undefined).map((gloss) => (
                  <li key={gloss}>{gloss}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DictionaryCard({ result, compact = false }: { result: DictionaryResult; compact?: boolean }) {
  const [onlineMeanings, setOnlineMeanings] = useState<string[]>([])
  const [onlineSource, setOnlineSource] = useState<OnlineChineseSource>('zh-wiktionary')
  const [youdao, setYoudao] = useState<YoudaoFrench | null>(null)

  useEffect(() => {
    setOnlineMeanings([])
    setOnlineSource('zh-wiktionary')
    setYoudao(null)
    const target = youdaoQuery(result)
    const wikiTarget = needsOnlineChinese(result)
    if ((typeof navigator !== 'undefined' && navigator.onLine === false) || (!target && !wikiTarget)) return
    let cancelled = false
    const run = async () => {
      let found: YoudaoFrench | null = null
      if (target) {
        found = await loadYoudaoFrench(target)
        if (cancelled) return
        if (found && (found.senses.length > 0 || found.examples.length > 0)) setYoudao(found)
      }
      if (!wikiTarget || (found && found.senses.length > 0)) return
      try {
        const outcome = await loadOnlineChinese(wikiTarget)
        if (!cancelled && outcome.zh.length > 0 && outcome.source) {
          setOnlineMeanings(outcome.zh)
          setOnlineSource(outcome.source)
        }
      } catch {
        // Wiktionary only fills in when Youdao has no Chinese gloss.
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [result])

  const primary = result.words[0] ?? result.lemmas[0]
  const youdaoGloss =
    youdao?.senses
      .slice(0, 2)
      .map((sense) => sense.gloss)
      .join('；') ?? ''
  if (!primary) {
    if (youdao || onlineMeanings.length > 0) {
      const meaning = youdaoGloss || onlineMeanings.slice(0, 3).join('；')
      return (
        <div data-testid="dictionary-result" className={compact ? 'space-y-3' : 'space-y-6'}>
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className={`${compact ? 'text-xl' : 'text-3xl'} font-semibold text-gray-950 dark:text-white`} lang="fr">
                {youdao?.word || result.query}
              </span>
              <button
                type="button"
                onClick={() => speakFrench(youdao?.word || result.query)}
                aria-label={`朗读 ${youdao?.word || result.query}`}
                className="rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-700"
              >
                <IconVolume className="h-5 w-5" />
              </button>
            </div>
            {youdao && <YoudaoBlock entry={youdao} compact={compact} />}
            <OnlineMeanings meanings={onlineMeanings} source={onlineSource} compact={compact} />
          </div>
          <AddToWordList word={youdao?.word || result.query} meaning={meaning} />
        </div>
      )
    }

    return (
      <p data-testid="dictionary-empty" className="text-sm leading-6 text-gray-500 dark:text-gray-400">
        离线词典里没有找到「{result.query}」。检查一下拼写，或者试试它的原形。
      </p>
    )
  }

  const hasOfflineChinese = primary.site.length > 0 || primary.entries.some((entry) => entry.zh.length > 0)
  const meaning =
    youdaoGloss || (!hasOfflineChinese && onlineMeanings.length > 0 ? onlineMeanings.slice(0, 3).join('；') : briefMeaning(result))

  return (
    <div data-testid="dictionary-result" className={compact ? 'space-y-3' : 'space-y-6'}>
      {result.words.map((item, index) => (
        <WordBlock
          key={item.word}
          item={item}
          compact={compact}
          onlineMeanings={index === 0 && !youdao?.senses.length ? onlineMeanings : undefined}
          onlineSource={onlineSource}
          youdao={index === 0 ? youdao : null}
        />
      ))}
      {result.lemmas.length > 0 && (
        <div className={result.words.length > 0 ? 'border-t border-gray-100 pt-4 dark:border-gray-700' : ''}>
          <div className="mb-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            「{result.query}」是 {result.lemmas.map((item) => item.word).join('、')} 的变化形式
          </div>
          <div className={compact ? 'space-y-3' : 'space-y-6'}>
            {result.lemmas.map((item, index) => (
              <WordBlock
                key={item.word}
                item={item}
                compact={compact}
                onlineMeanings={result.words.length === 0 && index === 0 && !youdao?.senses.length ? onlineMeanings : undefined}
                onlineSource={onlineSource}
                youdao={result.words.length === 0 && index === 0 ? youdao : null}
              />
            ))}
          </div>
        </div>
      )}
      <AddToWordList word={primary.word} meaning={meaning} />
    </div>
  )
}
