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
    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
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
          className="max-w-[10rem] rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 outline-none transition focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-850 dark:text-gray-200"
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
        className="inline-flex items-center rounded-xl bg-indigo-50 px-3 py-1.5 text-xs sm:text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
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
        <span role="status" className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
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

function GlossList({
  items,
  className = '',
  lang,
  fallbackBadge,
}: {
  items: string[]
  className?: string
  lang?: string
  fallbackBadge?: boolean
}) {
  if (items.length === 0) return null
  if (items.length === 1) {
    return (
      <div className={`text-sm leading-6 text-gray-900 dark:text-gray-100 ${className}`} lang={lang}>
        {fallbackBadge && (
          <span className="mr-1.5 inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/60 dark:text-gray-400">
            EN
          </span>
        )}
        {items[0]}
      </div>
    )
  }
  return (
    <div className={className} lang={lang}>
      {fallbackBadge && (
        <div className="mb-1">
          <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-700/60 dark:text-gray-400">
            EN
          </span>
        </div>
      )}
      <ol className="list-inside list-decimal space-y-0.5 text-sm leading-6 text-gray-900 dark:text-gray-100">
        {items.map((gloss) => (
          <li key={gloss}>{gloss}</li>
        ))}
      </ol>
    </div>
  )
}

function YoudaoSenses({ senses, source }: { senses: YoudaoFrench['senses']; source: string }) {
  if (senses.length === 0) return null
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-400 dark:text-gray-500">
        有道 · {source || '法汉词典'}
      </div>
      <div className="space-y-1.5">
        {senses.map((sense) => (
          <div key={`${sense.pos}-${sense.gloss}`} className="text-sm leading-7 text-gray-900 dark:text-gray-100 sm:text-base">
            {sense.pos && (
              <span className="mr-2 rounded bg-indigo-50 px-1.5 py-0.5 align-middle text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                {YOUDAO_POS[sense.pos] ?? sense.pos}
              </span>
            )}
            {sense.gloss}
          </div>
        ))}
      </div>
    </div>
  )
}

function OnlineMeanings({ meanings, source, compact }: { meanings: string[]; source: OnlineChineseSource; compact: boolean }) {
  if (meanings.length === 0) return null
  const label = source === 'fr-wiktionary' ? '法语维基词典译表 · 在线' : '中文维基词典 · 在线'
  const items = compact ? meanings.slice(0, 3) : meanings
  return (
    <div data-testid="dictionary-online" className="space-y-2">
      <div className="text-xs font-medium text-gray-400 dark:text-gray-500">{label}</div>
      <GlossList items={items} />
    </div>
  )
}

function ExampleList({ examples, compact }: { examples: YoudaoFrench['examples']; compact: boolean }) {
  if (examples.length === 0) return null
  const list = examples.slice(0, compact ? 1 : 2)
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-400 dark:text-gray-500">例句</div>
      <div className="space-y-3">
        {list.map((example) => (
          <div key={example.fr} className="space-y-0.5">
            <div lang="fr" className="text-sm font-medium leading-relaxed text-gray-900 dark:text-gray-100">
              {example.fr}
            </div>
            <div className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {example.zh}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WordBlock({
  item,
  compact,
  onlineMeanings = [],
  onlineSource,
  youdao = null,
  playingWord,
  onSpeak,
  meaning,
  showAdd = false,
}: {
  item: DictionaryWord
  compact: boolean
  onlineMeanings?: string[]
  onlineSource: OnlineChineseSource
  youdao?: YoudaoFrench | null
  playingWord: string | null
  onSpeak: (word: string) => void
  meaning: string
  showAdd?: boolean
}) {
  const ipa = item.entries.find((entry) => entry.ipa)?.ipa
  const hasYoudaoSenses = Boolean(youdao && youdao.senses.length > 0)
  const hasYoudaoExamples = Boolean(youdao && youdao.examples.length > 0)
  const isPlaying = playingWord === item.word

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {/* Headword Row */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-2.5">
          <span className={`${compact ? 'text-xl' : 'text-3xl'} font-bold tracking-tight text-gray-950 dark:text-white`} lang="fr">
            {item.word}
          </span>
          {ipa && <span className="font-mono text-sm text-gray-500 dark:text-gray-400">{ipa}</span>}
          <button
            type="button"
            onClick={() => onSpeak(item.word)}
            aria-label={`朗读 ${item.word}`}
            className={`inline-flex ${compact ? 'h-7 w-7' : 'h-9 w-9'} shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 ${
              isPlaying
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                : 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-700/60'
            }`}
          >
            <IconVolume className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} ${isPlaying ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {showAdd && <AddToWordList word={item.word} meaning={meaning} />}
      </div>

      {/* Senses / Definitions before Examples */}
      {youdao && hasYoudaoSenses && (
        <div data-testid="dictionary-youdao" className="space-y-4">
          <YoudaoSenses senses={youdao.senses} source={youdao.source} />
          {item.site.length > 0 && (
            <div className="border-t border-gray-100 pt-3 dark:border-gray-800/80">
              <div className="text-xs font-medium text-gray-400 dark:text-gray-500">本站词库</div>
              <div className="mt-1 text-sm leading-6 text-gray-900 dark:text-gray-100">{item.site.join('；')}</div>
            </div>
          )}
          {hasYoudaoExamples && (
            <div className="border-t border-gray-100 pt-3 dark:border-gray-800/80">
              <ExampleList examples={youdao.examples} compact={compact} />
            </div>
          )}
        </div>
      )}

      {!hasYoudaoSenses && (
        <>
          <OnlineMeanings meanings={onlineMeanings} source={onlineSource} compact={compact} />

          <div className="space-y-3">
            {item.entries.slice(0, compact ? 3 : undefined).map((entry, index) => {
              const hasZh = entry.zh.length > 0
              return (
                <div key={`${entry.pos}-${index}`} className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                      {POS_LABELS[entry.pos] ?? entry.pos}
                    </span>
                    {entry.gender && <span className="text-xs text-gray-400 dark:text-gray-500">{GENDER_LABELS[entry.gender]}</span>}
                  </div>
                  {hasZh && (
                    <GlossList items={entry.zh.slice(0, compact ? 3 : undefined)} />
                  )}
                  <GlossList
                    items={entry.en.slice(0, compact ? (hasZh ? 1 : 3) : undefined)}
                    className={hasZh ? 'text-gray-500 dark:text-gray-400' : ''}
                    lang="en"
                    fallbackBadge={!hasZh}
                  />
                </div>
              )
            })}
          </div>

          {item.site.length > 0 && (
            <div className="border-t border-gray-100 pt-3 dark:border-gray-800/80">
              <div className="text-xs font-medium text-gray-400 dark:text-gray-500">本站词库</div>
              <div className="mt-1 text-sm leading-6 text-gray-900 dark:text-gray-100">{item.site.join('；')}</div>
            </div>
          )}

          {youdao && hasYoudaoExamples && (
            <div data-testid="dictionary-youdao" className="border-t border-gray-100 pt-3 dark:border-gray-800/80">
              <ExampleList examples={youdao.examples} compact={compact} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function DictionaryCard({ result, compact = false }: { result: DictionaryResult; compact?: boolean }) {
  const [onlineMeanings, setOnlineMeanings] = useState<string[]>([])
  const [onlineSource, setOnlineSource] = useState<OnlineChineseSource>('zh-wiktionary')
  const [youdao, setYoudao] = useState<YoudaoFrench | null>(null)
  const [playingWord, setPlayingWord] = useState<string | null>(null)

  const handleSpeak = (word: string) => {
    setPlayingWord(word)
    void speakFrench(word, {
      onStart: () => setPlayingWord(word),
      onEnd: () => setPlayingWord((current) => (current === word ? null : current)),
    }).then((success) => {
      if (!success) {
        setPlayingWord((current) => (current === word ? null : current))
      }
    })
  }

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
      const headword = youdao?.word || result.query
      const hasYoudaoSenses = Boolean(youdao && youdao.senses.length > 0)
      const hasYoudaoExamples = Boolean(youdao && youdao.examples.length > 0)
      const isPlaying = playingWord === headword

      return (
        <div data-testid="dictionary-result" className={compact ? 'space-y-3' : 'space-y-5'}>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex items-center gap-2.5">
              <span className={`${compact ? 'text-xl' : 'text-3xl'} font-bold tracking-tight text-gray-950 dark:text-white`} lang="fr">
                {headword}
              </span>
              {youdao?.phone && <span className="font-mono text-sm text-gray-500 dark:text-gray-400">{youdao.phone}</span>}
              <button
                type="button"
                onClick={() => handleSpeak(headword)}
                aria-label={`朗读 ${headword}`}
                className={`inline-flex ${compact ? 'h-7 w-7' : 'h-9 w-9'} shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 ${
                  isPlaying
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                    : 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-700/60'
                }`}
              >
                <IconVolume className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} ${isPlaying ? 'animate-pulse' : ''}`} />
              </button>
            </div>
            <AddToWordList word={headword} meaning={meaning} />
          </div>

          {youdao && (hasYoudaoSenses || hasYoudaoExamples) && (
            <div data-testid="dictionary-youdao" className="space-y-4">
              {hasYoudaoSenses && <YoudaoSenses senses={youdao.senses} source={youdao.source} />}
              {hasYoudaoExamples && (
                <div className={hasYoudaoSenses ? 'border-t border-gray-100 pt-3 dark:border-gray-800/80' : ''}>
                  <ExampleList examples={youdao.examples} compact={compact} />
                </div>
              )}
            </div>
          )}

          <OnlineMeanings meanings={onlineMeanings} source={onlineSource} compact={compact} />
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
    <div data-testid="dictionary-result" className={compact ? 'space-y-3' : 'space-y-5'}>
      {result.words.map((item, index) => (
        <WordBlock
          key={item.word}
          item={item}
          compact={compact}
          onlineMeanings={index === 0 && !youdao?.senses.length ? onlineMeanings : undefined}
          onlineSource={onlineSource}
          youdao={index === 0 ? youdao : null}
          playingWord={playingWord}
          onSpeak={handleSpeak}
          meaning={meaning}
          showAdd={index === 0}
        />
      ))}

      {result.lemmas.length > 0 && (
        <div className={result.words.length > 0 ? 'border-t border-gray-100 pt-4 dark:border-gray-800/80' : ''}>
          <div className="mb-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            「{result.query}」是 {result.lemmas.map((item) => item.word).join('、')} 的变化形式
          </div>
          <div className={compact ? 'space-y-3' : 'space-y-5'}>
            {result.lemmas.map((item, index) => (
              <WordBlock
                key={item.word}
                item={item}
                compact={compact}
                onlineMeanings={result.words.length === 0 && index === 0 && !youdao?.senses.length ? onlineMeanings : undefined}
                onlineSource={onlineSource}
                youdao={result.words.length === 0 && index === 0 ? youdao : null}
                playingWord={playingWord}
                onSpeak={handleSpeak}
                meaning={meaning}
                showAdd={result.words.length === 0 && index === 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
