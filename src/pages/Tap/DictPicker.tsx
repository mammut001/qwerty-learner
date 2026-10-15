import { dictionaries } from '@/resources/dictionary'
import type { Dictionary } from '@/typings'
import groupBy from '@/utils/groupBy'
import range from '@/utils/range'
import { useMemo, useState } from 'react'

type DictPickerProps = {
  selectedDictId: string
  selectedChapter: number
  customDictionaries: Dictionary[]
  onPick: (dict: Dictionary, chapter: number) => void
}

/** Phone-friendly library and chapter picker: one tap opens a dictionary, another picks its chapter. */
export default function DictPicker({ selectedDictId, selectedChapter, customDictionaries, onPick }: DictPickerProps) {
  const [openId, setOpenId] = useState<string>(selectedDictId)

  const groups = useMemo(() => {
    const frenchDicts = [...customDictionaries, ...dictionaries].filter((dict) => dict.languageCategory === 'fr')
    return Object.entries(groupBy(frenchDicts, (dict) => dict.category))
  }, [customDictionaries])

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-5">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">点选练词</h1>
      <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
        不用键盘，看词或听音点选答案。练习记录和跟打共用。先选词库，再选章节。
      </p>

      {groups.map(([category, dicts]) => (
        <section key={category} className="mt-6">
          <h2 className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">{category}</h2>
          <div className="space-y-2">
            {dicts.map((dict) => {
              const open = openId === dict.id
              const isCurrent = selectedDictId === dict.id
              return (
                <div
                  key={dict.id}
                  className={`overflow-hidden rounded-2xl border bg-white dark:bg-gray-800 ${
                    isCurrent ? 'border-indigo-300 dark:border-indigo-500/60' : 'border-gray-200 dark:border-white/10'
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? '' : dict.id)}
                    className="flex w-full items-center justify-between gap-3 p-4 text-left"
                  >
                    <span className="min-w-0">
                      <span className="block break-words font-medium text-gray-900 dark:text-white">{dict.name}</span>
                      {dict.description && (
                        <span className="mt-0.5 block text-xs leading-5 text-gray-500 dark:text-gray-400">{dict.description}</span>
                      )}
                    </span>
                    <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">{dict.chapterCount} 章</span>
                  </button>
                  {open && (
                    <div className="grid grid-cols-4 gap-2 px-4 pb-4">
                      {range(0, dict.chapterCount, 1).map((index) => {
                        const selected = isCurrent && selectedChapter === index
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => onPick(dict, index)}
                            className={`h-11 rounded-xl border text-sm transition active:scale-95 ${
                              selected
                                ? 'border-indigo-500 bg-indigo-600 text-white'
                                : 'border-gray-200 text-gray-700 dark:border-white/10 dark:text-gray-200'
                            }`}
                          >
                            第 {index + 1} 章
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
