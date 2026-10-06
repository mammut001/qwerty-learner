import Header from '@/components/Header'
import Layout from '@/components/Layout'
import { CHAPTER_LENGTH } from '@/constants'
import { currentChapterAtom, currentDictIdAtom, reviewModeInfoAtom } from '@/store'
import {
  CUSTOM_DICT_LIMITS,
  type CustomDict,
  customDictsAtom,
  importedFileToText,
  parseWordListText,
  wordListToText,
} from '@/store/customDict'
import { saveAs } from 'file-saver'
import { useAtom, useSetAtom } from 'jotai'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IconPlus from '~icons/tabler/plus'
import IconTrash from '~icons/tabler/trash'

const NEW_LIST = 'new'
const EXAMPLE = ['le logement = 住房', 'déménager = 搬家', 'un bail = 租约', 'avoir besoin de = 需要', 'en revanche = 相反，然而'].join(
  '\n',
)

export default function CustomDictPage() {
  const [lists, setLists] = useAtom(customDictsAtom)
  const setCurrentDictId = useSetAtom(currentDictIdAtom)
  const setCurrentChapter = useSetAtom(currentChapterAtom)
  const setReviewModeInfo = useSetAtom(reviewModeInfoAtom)
  const navigate = useNavigate()
  const fileInput = useRef<HTMLInputElement>(null)

  const [selectedId, setSelectedId] = useState<string>(() => lists[0]?.id ?? NEW_LIST)
  const selected = lists.find((item) => item.id === selectedId)
  const [name, setName] = useState(selected?.name ?? '')
  const [description, setDescription] = useState(selected?.description ?? '')
  const [text, setText] = useState(selected ? wordListToText(selected.words) : '')
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const parsed = useMemo(() => parseWordListText(text), [text])
  const dirty = selected
    ? name.trim() !== selected.name ||
      description.trim() !== selected.description ||
      wordListToText(parsed.words) !== wordListToText(selected.words)
    : Boolean(name.trim() || text.trim())

  const open = (list: CustomDict | null) => {
    setSelectedId(list?.id ?? NEW_LIST)
    setName(list?.name ?? '')
    setDescription(list?.description ?? '')
    setText(list ? wordListToText(list.words) : '')
    setMessage(null)
    setConfirmingDelete(false)
  }

  const save = (): CustomDict | null => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setMessage({ tone: 'error', text: '先给词表起个名字。' })
      return null
    }
    if (parsed.words.length === 0) {
      setMessage({ tone: 'error', text: '词表里还没有可用的词条。每行写一个：mot = 释义' })
      return null
    }
    if (!selected && lists.length >= CUSTOM_DICT_LIMITS.lists) {
      setMessage({ tone: 'error', text: `最多保存 ${CUSTOM_DICT_LIMITS.lists} 个词表，请先删除不用的。` })
      return null
    }
    const now = Date.now()
    const next: CustomDict = {
      id: selected?.id ?? `custom-${crypto.randomUUID().slice(0, 8)}`,
      name: trimmedName,
      description: description.trim(),
      words: parsed.words,
      createdAt: selected?.createdAt ?? now,
      updatedAt: now,
    }
    try {
      setLists(selected ? lists.map((item) => (item.id === next.id ? next : item)) : [next, ...lists])
    } catch {
      setMessage({ tone: 'error', text: '保存失败：浏览器存储空间不足或被禁用。' })
      return null
    }
    setSelectedId(next.id)
    setName(next.name)
    setDescription(next.description)
    setText(wordListToText(next.words))
    setMessage({ tone: 'ok', text: `已保存 ${next.words.length} 个词条，共 ${Math.ceil(next.words.length / CHAPTER_LENGTH)} 章。` })
    return next
  }

  const practise = () => {
    const list = dirty || !selected ? save() : selected
    if (!list) return
    setCurrentDictId(list.id)
    setCurrentChapter(0)
    setReviewModeInfo((old) => ({ ...old, isReviewMode: false }))
    navigate('/typing')
  }

  const remove = () => {
    if (!selected) return
    const rest = lists.filter((item) => item.id !== selected.id)
    setLists(rest)
    open(rest[0] ?? null)
  }

  const importFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const imported = importedFileToText(file.name, await file.text())
      setText((old) => (old.trim() ? `${old.trim()}\n${imported}` : imported))
      if (!name.trim()) setName(file.name.replace(/\.[^.]+$/, '').slice(0, CUSTOM_DICT_LIMITS.name))
      setMessage({ tone: 'ok', text: `已读入 ${file.name}，检查无误后点保存。` })
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : '文件读取失败。' })
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const exportJson = () => {
    if (!selected) return
    const words = selected.words.map((word) => ({ name: word.name, trans: word.trans }))
    saveAs(new Blob([JSON.stringify(words, null, 2)], { type: 'application/json;charset=utf-8' }), `${selected.name}.json`)
  }

  const inputClass =
    'mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'

  return (
    <Layout>
      <Header />
      <main className="container mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-4 pb-10 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-indigo-500">自定义背单词</div>
            <h1 className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">我的词表</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              把自己整理的生词做成词表，用「单词跟打」练习。词表只保存在这台设备的浏览器里，换设备请用导出 / 导入。
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="my-card h-fit rounded-2xl bg-white p-4 dark:bg-gray-800">
            <button
              type="button"
              data-testid="word-list-new"
              onClick={() => open(null)}
              className={`flex w-full items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-medium transition ${
                selectedId === NEW_LIST
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40'
                  : 'border-gray-300 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              <IconPlus className="h-4 w-4" />
              新建词表
            </button>
            <ul className="mt-3 space-y-2">
              {lists.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => open(item)}
                    className={`w-full rounded-xl px-4 py-3 text-left transition ${
                      item.id === selectedId ? 'bg-indigo-500 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`truncate font-medium ${item.id === selectedId ? '' : 'text-gray-900 dark:text-gray-100'}`}>
                      {item.name}
                    </div>
                    <div className={`mt-0.5 text-xs ${item.id === selectedId ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {item.words.length} 词 · {Math.ceil(item.words.length / CHAPTER_LENGTH)} 章
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            {lists.length === 0 && (
              <p className="mt-4 px-1 text-xs leading-5 text-gray-400">还没有词表。在右边粘贴词条，保存后就会出现在这里和词库页。</p>
            )}
          </aside>

          <section className="my-card rounded-2xl bg-white p-5 dark:bg-gray-800 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">词表名称</span>
                <input
                  value={name}
                  maxLength={CUSTOM_DICT_LIMITS.name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="例如：模考生词 10 月"
                  aria-label="词表名称"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">备注（可选）</span>
                <input
                  value={description}
                  maxLength={CUSTOM_DICT_LIMITS.description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="例如：阅读套题 B 里不认识的词"
                  aria-label="词表备注"
                  className={inputClass}
                />
              </label>
            </div>

            <label className="mt-5 block">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">词条 · 每行一个，格式：mot = 释义</span>
                <span className="flex gap-3 text-xs">
                  {!text.trim() && (
                    <button type="button" onClick={() => setText(EXAMPLE)} className="text-indigo-500 hover:underline">
                      填入示例
                    </button>
                  )}
                  <button type="button" onClick={() => fileInput.current?.click()} className="text-indigo-500 hover:underline">
                    从文件导入（.txt / .csv / .json）
                  </button>
                </span>
              </div>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={14}
                spellCheck={false}
                aria-label="词条"
                placeholder={EXAMPLE}
                className={`${inputClass} resize-y font-mono leading-6`}
              />
            </label>
            <input
              ref={fileInput}
              type="file"
              accept=".txt,.csv,.json,text/plain,text/csv,application/json"
              className="hidden"
              data-testid="word-list-file"
              onChange={(event) => void importFile(event.target.files?.[0])}
            />

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              <span data-testid="word-list-count">
                识别到 {parsed.words.length} 个词条 · {Math.ceil(parsed.words.length / CHAPTER_LENGTH)} 章（每章 {CHAPTER_LENGTH} 词）
              </span>
              {parsed.duplicates > 0 && <span className="text-amber-600">已忽略 {parsed.duplicates} 个重复词条</span>}
              {parsed.tooLong > 0 && <span className="text-amber-600">已跳过 {parsed.tooLong} 行过长的内容</span>}
              {parsed.truncated && <span className="text-amber-600">超过 {CUSTOM_DICT_LIMITS.words} 词的部分不会保存</span>}
              <span>分隔符可用 =、Tab、：或 |；释义可以不写；# 开头的行会被忽略</span>
            </div>

            {message && (
              <div
                role="status"
                className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                  message.tone === 'ok'
                    ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300'
                    : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="button" data-testid="word-list-practise" onClick={practise} className="my-btn-primary px-6 py-2 text-base">
                {dirty || !selected ? '保存并开始练习' : '开始练习'}
              </button>
              <button
                type="button"
                data-testid="word-list-save"
                disabled={!dirty}
                onClick={() => save()}
                className="rounded-lg border border-gray-200 px-5 py-2 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-200"
              >
                保存
              </button>
              {selected && (
                <>
                  <button
                    type="button"
                    onClick={exportJson}
                    className="rounded-lg border border-gray-200 px-5 py-2 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-200"
                  >
                    导出 JSON
                  </button>
                  {confirmingDelete ? (
                    <span className="ml-auto flex items-center gap-2 text-sm text-red-600">
                      确定删除「{selected.name}」？
                      <button
                        type="button"
                        data-testid="word-list-delete-confirm"
                        onClick={remove}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                      >
                        删除
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDelete(false)}
                        className="rounded-lg px-3 py-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        取消
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      data-testid="word-list-delete"
                      onClick={() => setConfirmingDelete(true)}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                    >
                      <IconTrash className="h-4 w-4" />
                      删除词表
                    </button>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </Layout>
  )
}
